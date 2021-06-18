import type { NextApiRequest, NextApiResponse } from 'next'
import sp from 'superagent'
import cheerio from 'cheerio'

type Data = {
  id: string,
  name: string
}

type Info = {
  id: string,
  name: string,
  number: string,
  price: string
}

const getPriceNum = (text: string) => {
  return text.slice(1, -3);
};
const transformPriceNum = (num: string) => {
  if (num.includes("万")) {
    return parseFloat(num) * 10000;
  } else {
    return parseFloat(num);
  }
};

const getTeaInfoById = async (id: string) => {
  const URL = `https://www.donghetea.com/goods.php?id=${id}`;
  let info: any = {},
    nameText,
    unitText,
    priceText,
    priceTextNumber;

  await (async () => {
    let html = await sp.get(URL);
    let $ = cheerio.load(html.text);
    nameText = $(".textInfo h1").text();
    unitText = $(".buyli ul .pro:nth-child(3) span").text();
    priceText = $(".shop_sb").text();
    priceTextNumber = getPriceNum(priceText);

    const nameTextArray = nameText.split(" ");
    info.id = id;
    info.number =
      nameTextArray[0] && nameTextArray[0].replace("(升降价通知)", "");
    info.name =
      nameTextArray[1] && nameTextArray[1].replace("(升降价通知)", "");

    const unit = priceText.slice(-1);
    switch (unit) {
      case "件":
        {
          const jianUnitText = unitText
            .split(" ")
            .filter((i) => i.includes("提/件"));
          const tiUnitText = unitText
            .split(" ")
            .filter((i) => i.includes("片/提"));
          const jianUnitTextNum = parseFloat(jianUnitText[0]);
          const tiUnitTextNum = parseFloat(tiUnitText[0]);
          const price =
            transformPriceNum(priceTextNumber) / (jianUnitTextNum * tiUnitTextNum);
          info.price = Math.round(price);
        }
        break;
      case "提":
        {
          const tiUnitText = unitText
            .split(" ")
            .filter((i) => i.includes("片/提"));
          const tiUnitTextNum = parseFloat(tiUnitText[0]);
          const price = transformPriceNum(priceTextNumber) / tiUnitTextNum;
          info.price = Math.round(price);
        }
        break;
      case "片":
        info.price = priceTextNumber;
        break;
      case "罐":
        info.price = priceTextNumber;
        break;
      default:
        info.price = "没有单位";
    }
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
          console.log(e);
          infoList.push(e);
        }
      }
      const data = await getTeaInfoById(id as string)
      console.log(infoList)
      // Get data from your database
      res.status(200).json({ id, data: infoList })
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