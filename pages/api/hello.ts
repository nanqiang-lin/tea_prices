// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  // request('https://tweb.donghetea.com/tea/api/portal/home/newProduct?productId=2352&latestDealNum=5', function (error: any, response: any, body: any) {
  //   console.log('error:', error);
  //   console.log('statusCode:', response && response.statusCode);
  //   console.log(JSON.parse(body).data);
  // });
  axios.get('https://tweb.donghetea.com/tea/api/portal/home/newProduct?productId=2352&latestDealNum=5')
  .then(function (response) {
    // handle success
    console.log(response.data.data);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });
  
  res.status(200).json({ name: 'John Doe' })
}
