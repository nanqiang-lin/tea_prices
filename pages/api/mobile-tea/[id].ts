import type { NextApiRequest, NextApiResponse } from 'next'
import sp from 'superagent'
import puppeteer from 'puppeteer'
import cheerio from 'cheerio'

import { transformPriceNum } from '../../../common/utils';

const pattern = new RegExp("[\u4e00-\u9fa5]+")
const getTeaInfoById = async (id: string) => {
  const URL = `https://tweb.donghetea.com/#/pages/sale/productDetail?id=${id}`;
  const API_URL = `https://tweb.donghetea.com/tea/api/portal/product/getUnitList/?productId=${id}`;
  let info: any = {},
    nameText,
    unitText,
    priceText,
    priceTextNumber;

  await (async () => {
    const browser = await puppeteer.launch({
      /**
       * Use the default headless mode (don't show the browser).
       */
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto(URL);
    // await page.waitForSelector('.good-name')
    await page.waitForRequest(API_URL);
    // await page.waitForRequest('https://tweb.donghetea.com/tea/api/portal/product/getUnitList/?productId=1766');
    // await page.screenshot({path: 'full.png', fullPage: true});

    const content = await page.content();

    const $ = cheerio.load(content);
    nameText = $(".good-name").text();
    unitText = $(".unitText span").text();
    priceText = $(".good-price").text();
    priceTextNumber = priceText.slice(1, -2);

    const nameTextArray = nameText.split(" ");
    info.id = id;
    info.number =
      nameTextArray[0] && nameTextArray[0].replace("(升降价通知)", "");
    info.name =
      nameTextArray[1] && nameTextArray[1].replace("(升降价通知)", "");

    const allUnits = unitText.split(' ')
    const units = allUnits.filter(unit => !(unit.includes('克') || unit.includes('g')))
    const minUnit = units[0].match(pattern)?.[0] || ''
    let theAllUnits = 1
    units.forEach(unit => theAllUnits *= parseFloat(unit))
    const price = 
            transformPriceNum(priceTextNumber) / theAllUnits;
    info.price = `${Math.round(price)} ${minUnit}`;
    await browser.close();
  })();
  return info;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req
  const ids = (id as string).split(',')
  switch (method) {
    case 'GET':
      const infoList = [];
      for (let id of ids) {
        try {
          const info = id && (await getTeaInfoById(id));
          infoList.push(info);
        } catch (e) {
          console.log(e.status);
          return res.status(500).end(`Something went wrong!`)
        }
      }
      console.log(infoList, '===========')
      // Get data from your database
      res.status(200).json({ id: ids, data: infoList })
      break
    // case 'PUT':
    //   // Update or create data in your database
    //   res.status(200).json({ id, name: name || `User ${id}` })
    //   break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}