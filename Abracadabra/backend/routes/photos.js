import express from 'express';
import multer from 'multer';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME, PHOTOS_PREFIX } from '../config/s3.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

const router = express.Router();

// Function to update CSV with photo URLs
const updateCSVWithPhotos = async (propertyId, photoUrl) => {
  try {
    const csvPath = './data/properties_with_photos.csv';
    const properties = [];
    
    // Read existing CSV
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(csvPath)) {
        console.log('CSV file does not exist yet');
        resolve();
        return;
      }
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          properties.push(row);
        })
        .on('end', async () => {
          // Update the specific property
          const propertyIndex = parseInt(propertyId) - 1;
          if (propertyIndex >= 0 && propertyIndex < properties.length) {
            const property = properties[propertyIndex];
            
            // Add photo to gallery_photos_urls
            const existingPhotos = property.gallery_photos_urls || '';
            const photoUrls = existingPhotos ? existingPhotos.split(',') : [];
            photoUrls.push(photoUrl);
            property.gallery_photos_urls = photoUrls.join(',');
            
            // If no main photo exists, set this as main photo
            if (!property.main_photo_url) {
              property.main_photo_url = photoUrl;
            }
            
            // Write updated CSV
            const csvWriter = createObjectCsvWriter({
              path: csvPath,
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
            
            await csvWriter.writeRecords(properties);
            console.log(`✅ Updated CSV with photo for property ${propertyId}`);
          }
          resolve();
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('Error updating CSV:', error);
  }
};

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  },
});

// Upload single photo
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { propertyId } = req.body;
    
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${PHOTOS_PREFIX}${propertyId}/photo-${uuidv4()}${fileExtension}`;

    // Upload to Yandex Object Storage
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read', // Make photos publicly accessible
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const photoUrl = `https://${BUCKET_NAME}.storage.yandexcloud.net/${fileName}`;

    await updateCSVWithPhotos(propertyId, photoUrl);

    res.json({
      success: true,
      photoUrl,
      fileName,
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Upload multiple photos
router.post('/upload-multiple', upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { propertyId } = req.body;
    const uploadPromises = [];
    const photoUrls = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileExtension = path.extname(file.originalname);
      const fileName = `${PHOTOS_PREFIX}${propertyId}/photo-${i + 1}-${uuidv4()}${fileExtension}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      uploadPromises.push(s3Client.send(uploadCommand));
      photoUrls.push(`https://${BUCKET_NAME}.storage.yandexcloud.net/${fileName}`);
    }

    await Promise.all(uploadPromises);

    // Update CSV with all uploaded photos
    for (const photoUrl of photoUrls) {
      await updateCSVWithPhotos(propertyId, photoUrl);
    }

    res.json({
      success: true,
      photoUrls,
      message: `${req.files.length} photos uploaded successfully`,
    });
  } catch (error) {
    console.error('Multiple photos upload error:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Delete photo
router.delete('/delete', async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(deleteCommand);

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Photo deletion error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// List photos for a property
router.get('/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Read photos from CSV to get existing photo URLs
    const csvPath = './data/properties_with_photos.csv';
    const properties = [];
    
    if (!fs.existsSync(csvPath)) {
      return res.json([]);
    }
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          properties.push(row);
        })
        .on('end', () => {
          const propertyIndex = parseInt(propertyId) - 1;
          if (propertyIndex >= 0 && propertyIndex < properties.length) {
            const property = properties[propertyIndex];
            const photos = [];
            
            // Add main photo if exists
            if (property.main_photo_url) {
              photos.push({
                url: property.main_photo_url,
                type: 'main',
                fileName: property.main_photo_url.split('/').pop()
              });
            }
            
            // Add gallery photos if exist
            if (property.gallery_photos_urls) {
              const galleryUrls = property.gallery_photos_urls.split(',');
              galleryUrls.forEach(url => {
                if (url.trim()) {
                  photos.push({
                    url: url.trim(),
                    type: 'gallery',
                    fileName: url.trim().split('/').pop()
                  });
                }
              });
            }
            
            // Add floor plan if exists
            if (property.floor_plan_url) {
              photos.push({
                url: property.floor_plan_url,
                type: 'floor-plan',
                fileName: property.floor_plan_url.split('/').pop()
              });
            }
            
            res.json(photos);
          } else {
            res.json([]);
          }
          resolve();
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          res.status(500).json({ error: 'Failed to fetch property photos' });
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error fetching property photos:', error);
    res.status(500).json({ error: 'Failed to fetch property photos' });
  }
});

// Generate presigned URL for direct upload (optional)
router.post('/presigned-url', async (req, res) => {
  try {
    const { propertyId, fileType, photoType = 'main' } = req.body;
    
    const fileName = `${PHOTOS_PREFIX}${propertyId}/${photoType}-${uuidv4()}.${fileType}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: `image/${fileType}`,
      ACL: 'public-read',
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    res.json({
      success: true,
      uploadUrl: signedUrl,
      photoUrl: `https://${BUCKET_NAME}.storage.yandexcloud.net/${fileName}`,
      fileName,
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

export default router; 