import fs from 'fs';
import path from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, PHOTOS_PREFIX } from '../config/s3.js';
import { v4 as uuidv4 } from 'uuid';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

const PHOTOS_DIR = './photos'; // Local photos directory
const CSV_INPUT = './data/properties.csv';
const CSV_OUTPUT = './data/properties_with_photos.csv';

async function uploadPhoto(filePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();
    
    let contentType = 'image/jpeg';
    if (fileExtension === '.png') contentType = 'image/png';
    if (fileExtension === '.webp') contentType = 'image/webp';

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3Client.send(uploadCommand);
    const photoUrl = `https://${BUCKET_NAME}.storage.yandexcloud.net/${s3Key}`;
    
    console.log(`✅ Uploaded: ${filePath} -> ${photoUrl}`);
    return photoUrl;
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error.message);
    return null;
  }
}

async function processPropertyPhotos() {
  const properties = [];
  
  // Read existing CSV
  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_INPUT)
      .pipe(csv())
      .on('data', (row) => {
        properties.push(row);
      })
      .on('end', async () => {
        console.log(`📁 Found ${properties.length} properties in CSV`);
        
        const updatedProperties = [];
        
        for (let i = 0; i < properties.length; i++) {
          const property = properties[i];
          const propertyId = i + 1; // Use index + 1 as property ID
          const propertyDir = path.join(PHOTOS_DIR, `property-${propertyId}`);
          
          console.log(`\n🏠 Processing property ${propertyId}: ${property.project_name}`);
          
          let mainPhotoUrl = '';
          let galleryUrls = [];
          let floorPlanUrl = '';
          
          if (fs.existsSync(propertyDir)) {
            const files = fs.readdirSync(propertyDir);
            
            for (const file of files) {
              const filePath = path.join(propertyDir, file);
              const fileName = path.parse(file).name;
              const fileExt = path.parse(file).ext;
              
              if (fs.statSync(filePath).isFile()) {
                const s3Key = `${PHOTOS_PREFIX}${propertyId}/${fileName}-${uuidv4()}${fileExt}`;
                const photoUrl = await uploadPhoto(filePath, s3Key);
                
                if (photoUrl) {
                  if (fileName === 'main') {
                    mainPhotoUrl = photoUrl;
                  } else if (fileName.startsWith('gallery')) {
                    galleryUrls.push(photoUrl);
                  } else if (fileName === 'floor-plan') {
                    floorPlanUrl = photoUrl;
                  }
                }
              }
            }
          } else {
            console.log(`⚠️  No photos directory found for property ${propertyId}`);
          }
          
          // Add photo URLs to property data
          const updatedProperty = {
            ...property,
            main_photo_url: mainPhotoUrl,
            gallery_photos_urls: galleryUrls.join(','),
            floor_plan_url: floorPlanUrl,
          };
          
          updatedProperties.push(updatedProperty);
        }
        
        // Write updated CSV
        const csvWriter = createObjectCsvWriter({
          path: CSV_OUTPUT,
          header: [
            { id: 'developer_name', title: 'developer_name' },
            { id: 'project_name', title: 'project_name' },
            { id: 'property_type', title: 'property_type' },
            { id: 'rooms_count', title: 'rooms_count' },
            { id: 'area', title: 'area' },
            { id: 'price_total', title: 'price_total' },
            { id: 'completion_year', title: 'completion_year' },
            { id: 'address', title: 'address' },
            { id: 'main_photo_url', title: 'main_photo_url' },
            { id: 'gallery_photos_urls', title: 'gallery_photos_urls' },
            { id: 'floor_plan_url', title: 'floor_plan_url' },
          ],
        });
        
        try {
          await csvWriter.writeRecords(updatedProperties);
          console.log(`\n✅ Updated CSV saved to: ${CSV_OUTPUT}`);
          console.log(`📊 Processed ${updatedProperties.length} properties`);
          resolve();
        } catch (error) {
          console.error('❌ Failed to write CSV:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Run the script
console.log('🚀 Starting property photos upload...');
processPropertyPhotos()
  .then(() => {
    console.log('\n🎉 Photo upload completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error during photo upload:', error);
    process.exit(1);
  }); 