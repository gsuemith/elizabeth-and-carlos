import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Save the Date</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: 600px 900px;
      margin: 0;
    }

    body {
      font-family: 'Georgia', serif;
      background: transparent;
      margin: 0;
      padding: 0;
      width: 600px;
    }

    .invitation-card {
      width: 600px;
      height: 900px;
      background: linear-gradient(135deg, #ffffff 0%, #ede5d8 100%);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 40px;
      gap: 20px;
    }

    .front-photo-section {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .invitation-front-photo {
      width: 100%;
      max-width: 400px;
      height: auto;
      max-height: 300px;
      border-radius: 8px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      object-fit: cover;
    }

    .front-wedding-info {
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .info-website {
      font-size: 0.95rem;
      color: #5a4a3a;
      text-align: center;
      margin-bottom: 20px;
    }

    .info-title {
      font-size: 1.6rem;
      color: #5a4a3a;
      text-align: center;
      margin-bottom: 20px;
    }

    .info-section {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e8d5c4;
    }

    .info-section:last-of-type {
      border-bottom: 1px solid #e8d5c4;
    }

    .info-heading {
      font-size: 1.1rem;
      color: #5a4a3a;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .info-address {
      font-size: 1rem;
      color: #7a6a5a;
      line-height: 1.6;
      margin-bottom: 8px;
      text-decoration: none;
    }

    .info-date {
      font-size: 1.1rem;
      color: #7a6a5a;
      margin-bottom: 8px;
    }

    .info-time {
      font-size: 0.95rem;
      color: #5a4a3a;
      font-weight: 500;
      margin-bottom: 0;
    }

    .info-closing {
      font-size: 1rem;
      color: #5a4a3a;
      text-align: center;
      margin: 20px 0 15px;
    }

    .info-signature {
      font-size: 1rem;
      color: #5a4a3a;
      text-align: center;
      margin-top: 15px;
    }

    .page {
      width: 600px;
      height: 900px;
      page-break-after: always;
      page-break-inside: avoid;
      overflow: hidden;
      box-sizing: border-box;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .back-photo-page {
      width: 600px;
      height: 900px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      page-break-inside: avoid;
    }

    .back-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="invitation-card">
      <div class="front-photo-section">
        <img 
          src="FRONT_IMAGE_PLACEHOLDER" 
          alt="Elizabeth and Carlos" 
          class="invitation-front-photo" 
        />
      </div>
      <div class="front-wedding-info">
        <p class="info-website">www.CarlosAndElizabeth2026.com</p>
        <h2 class="info-title">Save the Date!</h2>
        
        <div class="info-section">
          <h3 class="info-heading">Welcome Gathering, Location TBD</h3>
          <p class="info-date">Thursday, July 16th</p>
          <p class="info-time">7:00 PM</p>
        </div>

        <div class="info-section">
          <h3 class="info-heading">Ceremony at Memorial Chapel</h3>
          <p class="info-address">Chapel Dr., Lake Junaluska, NC 28745</p>
          <p class="info-date">Friday, July 17th</p>
          <p class="info-time">5:30 PM</p>
        </div>

        <p class="info-closing">We can't wait to celebrate with you!</p>
        <p class="info-signature">With love,<br />Elizabeth & Carlos</p>
      </div>
    </div>
  </div>
  <div class="page">
    <div class="back-photo-page">
      <img 
        src="BACK_IMAGE_PLACEHOLDER" 
        alt="Elizabeth and Carlos" 
        class="back-photo" 
      />
    </div>
  </div>
</body>
</html>`;

async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Convert front image to base64 for embedding in HTML
  const frontImagePath = path.join(__dirname, 'public', 'carlos-elizabeth-seated.jpeg');
  const frontImageBuffer = fs.readFileSync(frontImagePath);
  const frontImageBase64 = frontImageBuffer.toString('base64');
  const frontImageDataUrl = `data:image/jpeg;base64,${frontImageBase64}`;
  
  // Convert back image to base64 for embedding in HTML
  const backImagePath = path.join(__dirname, 'public', 'carlos-elizabeth-carried.jpeg');
  const backImageBuffer = fs.readFileSync(backImagePath);
  const backImageBase64 = backImageBuffer.toString('base64');
  const backImageDataUrl = `data:image/jpeg;base64,${backImageBase64}`;
  
  const htmlWithImages = htmlContent
    .replace('FRONT_IMAGE_PLACEHOLDER', frontImageDataUrl)
    .replace('BACK_IMAGE_PLACEHOLDER', backImageDataUrl);
  
  await page.setContent(htmlWithImages, { waitUntil: 'networkidle0' });
  
  // Wait for images to load
  await page.waitForSelector('.invitation-front-photo');
  await page.waitForSelector('.back-photo');
  
  const pdfPath = path.join(__dirname, 'public', 'save-the-date.pdf');
  await page.pdf({
    path: pdfPath,
    width: '600px',
    height: '900px',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });
  
  await browser.close();
  console.log(`PDF generated successfully at ${pdfPath}`);
}

generatePDF().catch(console.error);

