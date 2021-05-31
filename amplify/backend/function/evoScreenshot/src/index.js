/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_MOBIUSEVOUSERFILES_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const chromium = require('chrome-aws-lambda');

const mobiusUrl = "https://design-automation.github.io/mobius-viewer-dev-0-7/?file="
const s3Url = "https://mobius-evo-userfiles131353-dev.s3.amazonaws.com/"
const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

exports.handler = async (event, context) => {
  let result = null;
  let browser = null;

  const gi_file_key = event.Records[0].s3.object.key
  const gi_file_url = s3Url + gi_file_key
  const pageURL = mobiusUrl + gi_file_url
  const save_path = gi_file_key.replace(".gi", ".png")

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();
    await page.setUserAgent(agent)

    console.log('Navigating to page: ', pageURL)

    await page.goto(pageURL)
    await page.waitForSelector("#spinner-div", {visible: false, hidden: true})
    const buffer = await page.screenshot()
    result = await page.title()

    // upload the image
    const s3result = await s3
      .upload({
        "Bucket": "mobius-evo-userfiles131353-dev", //process.env.STORAGE_MOBIUSEVOUSERFILES_BUCKETNAME,
        "Key": save_path,
        "Body": buffer,
        "ContentType": 'image/png',
        "ACL": 'public-read'
      })
      .promise()
      
    console.log('S3 image URL:', s3result.Location)
    
    await page.close();
    await browser.close();
    
  } catch (error) {
    console.log(error)
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return result
}
