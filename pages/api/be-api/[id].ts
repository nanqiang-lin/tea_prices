import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

import { transformPriceNum } from '../../../common/utils';

const pattern = new RegExp("[\u4e00-\u9fa5]+")
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getTeaInfoById = async (id: string) => {
  const URL = `https://tweb.donghetea.com/tea/api/portal/home/newProduct?productId=${id}&latestDealNum=5`;
  let info: any = {},
    nameText,
    unitText,
    priceText,
    priceTextNumber;

  try {
    await (async () => {
      const response = await axios.get(URL)
      const data = response.data.data
      nameText = data.name;
      unitText = data.unitRemark;
      priceText = data.marketPrice;
      priceTextNumber = priceText;
  
      const nameTextArray = nameText.split(" ");
      info.id = id;
      info.number = nameTextArray[0]
      info.name = nameTextArray[1]
  
      const allUnits: string[] = unitText.split(' ')
      const units = allUnits.filter(unit => !(unit.includes('克') || unit.includes('g')))
      const minUnit = data.minPriceUnit || units[0].match(pattern)?.[0] || ''
      let theAllUnits = 1
      units.forEach(unit => theAllUnits *= parseFloat(unit))
      const price = priceTextNumber / theAllUnits;
      info.price = `${Math.round(price)} ${minUnit}`;
    })();
  } catch (e) {
    throw  e
  }
  return info
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
      const requests = []
      for (let id of ids) {
        if (id) {
          requests.push(getTeaInfoById(id), sleep(Math.random() * 2000))
        }
      }
      try {
        const infoList = await Promise.all(requests)
        console.log(infoList, '===========')
        res.status(200).json({ id: ids, data: infoList.filter(i => i) })
      }  catch (e) {
        console.log(e.status);
        return res.status(500).end(`Something went wrong! ${e.status} ${JSON.stringify(e)}`)
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}