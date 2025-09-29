import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyMap = ({ property, className = "w-full h-64" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('PropertyMap: Loading timeout reached');
      setIsLoading(false);
      setHasError(true);
    }, 10000); // 10 seconds timeout

    if (!mapRef.current || !property || !property.coordinates) {
      console.log('PropertyMap: Missing requirements', {
        mapRef: !!mapRef.current,
        property: !!property,
        coordinates: !!property?.coordinates
      });
      clearTimeout(loadingTimeout);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // Validate coordinates
    const [lat, lng] = property.coordinates;
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates for property:', property.name, property.coordinates);
      return;
    }

    console.log('PropertyMap: Initializing map for', property.name, 'at', [lat, lng]);

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Clear the map container's _leaflet_id to allow reinitialization
    if (mapRef.current && mapRef.current._leaflet_id) {
      delete mapRef.current._leaflet_id;
    }

    // Add a delay to ensure the DOM element is ready and CSS layout has settled
    setTimeout(() => {
      if (!mapRef.current) {
        console.log('PropertyMap: mapRef.current is null after timeout');
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        const dimensions = {
          width: mapRef.current.offsetWidth,
          height: mapRef.current.offsetHeight
        };
        
        console.log('PropertyMap: DOM element dimensions:', dimensions);

        // Check if the element has proper dimensions
        if (dimensions.width < 50 || dimensions.height < 50) {
          console.warn('PropertyMap: Container dimensions too small:', dimensions);
          
          // Wait a bit more for CSS layout to settle
          setTimeout(() => {
            if (mapRef.current) {
              const finalDimensions = {
                width: mapRef.current.offsetWidth,
                height: mapRef.current.offsetHeight
              };
              console.log('PropertyMap: Final dimensions after additional wait:', finalDimensions);
              
              // Force the map to invalidate size if it was created with small dimensions
              if (mapInstanceRef.current && finalDimensions.width > 50) {
                mapInstanceRef.current.invalidateSize();
                console.log('PropertyMap: Forced size invalidation due to initial small dimensions');
              }
            }
          }, 500);
        }

        // Double-check that the container isn't already initialized
        if (mapRef.current._leaflet_id) {
          console.log('PropertyMap: Container still has _leaflet_id, clearing it');
          delete mapRef.current._leaflet_id;
        }

        // Initialize map
        const map = L.map(mapRef.current, {
          attributionControl: false,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true
        }).setView([lat, lng], 15); // Zoom level 15 for detailed view

        mapInstanceRef.current = map;
        console.log('PropertyMap: Map initialized successfully');

        // Add custom attribution control
        L.control.attribution({
          prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>'
        }).addTo(map);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Create custom marker icon for the property
        const propertyIcon = L.divIcon({
          html: `
            <div style="
              background-color: #ef4444;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              border: 3px solid #ffffff;
              transform: rotate(-45deg);
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: 12px;
              ">🏠</div>
            </div>
          `,
          className: 'custom-property-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30]
        });

        // Add marker for the property
        const marker = L.marker([lat, lng], { icon: propertyIcon }).addTo(map);

        // Create popup content
        const popupContent = `
          <div class="property-popup-detail" style="min-width: 200px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
              ${property.name}
            </h3>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
              📍 ${property.address}
            </div>
            <div style="font-size: 14px; color: #059669; font-weight: 600; margin-bottom: 8px;">
              💰 ${property.formatted_price}
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              🏢 ${property.developer}<br/>
              🏗️ ${property.project}<br/>
              🏠 ${property.property_type}, ${property.rooms} комн.
              ${property.area ? `, ${property.area} м²` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup-detail'
        });

        // Open popup by default
        marker.openPopup();

        // Add a circle to highlight the area around the property
        L.circle([lat, lng], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.1,
          radius: 200 // 200 meters radius
        }).addTo(map);

        setIsLoading(false);
        clearTimeout(loadingTimeout);

        // Force map to invalidate size after a short delay
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
            console.log('PropertyMap: Map size invalidated');
          }
        }, 200);

      } catch (error) {
        console.error('PropertyMap: Error initializing map:', error);
        clearTimeout(loadingTimeout);
        setHasError(true);
        setIsLoading(false);
      }
    }, 200);

    // Cleanup function
    return () => {
      clearTimeout(loadingTimeout);
      
      if (mapInstanceRef.current) {
        console.log('PropertyMap: Cleaning up map instance');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      // Clear the leaflet ID from the DOM element
      if (mapRef.current && mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id;
      }
      
      setIsLoading(false);
      setHasError(false);
    };
  }, [property?.id, property?.coordinates]);

  if (!property || !property.coordinates) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">📍</div>
          <div>Местоположение недоступно</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className={`${className} rounded-lg overflow-hidden border border-gray-200`}
        style={{ zIndex: 1, minHeight: '200px' }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-20">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div>Загрузка карты...</div>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 bg-red-50 rounded-lg flex items-center justify-center z-20">
          <div className="text-center text-red-500">
            <div className="text-2xl mb-2">⚠️</div>
            <div>Ошибка загрузки карты</div>
          </div>
        </div>
      )}
      
      {/* Map controls overlay */}
      {!isLoading && !hasError && (
        <div className="absolute top-2 right-2 z-10 bg-white rounded-lg shadow-md p-2 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span>🗺️</span>
            <span>Интерактивная карта</span>
          </div>
        </div>
      )}
      
      {/* Address overlay */}
      {!isLoading && !hasError && (
        <div className="absolute bottom-2 left-2 z-10 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
          📍 {property.address}
        </div>
      )}
    </div>
  );
};

export default PropertyMap; 