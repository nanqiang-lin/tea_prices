import Head from 'next/head'
import { ChangeEvent, useEffect, useMemo, useState } from "react"
import useHttp from "../../hooks/use-http"

interface TeaInfo {
  id: string,
  number: string,
  name: string,
  price: string,
}
const TeaPrices = () => {
  const [ids, setIds] = useState('')
  const [teaInfo, setTeaInfo] = useState<TeaInfo[]>()
  const { isLoading, error, sendRequest } = useHttp()

  const applyData = (data: {
    id: string[],
    data: TeaInfo[]
  }) => {
    setTeaInfo(data.data)
  }

  const pricesList = useMemo(() => {
    return teaInfo?.map(info => info)
  }, [teaInfo])

  const tds = useMemo(() => {
    return pricesList?.map(item => {
      return (
        <tr key={item.id}>
          <td>{ item.id }</td>
          <td>{ item.number }</td>
          <td>{ item.name }</td>
          <td>{ item.price }</td>
        </tr>
      )
    })
  }, [pricesList])

  const onChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIds(e.target.value)
  }
  const onClickHandler = (mobile?: boolean) => {
    if (!ids) {
      alert('请输入 id')
      return
    }
    if (isLoading) return
    const apiUrl = mobile ? `/api/mobile-tea/${ids}` : `/api/tea/${ids}`
    sendRequest({
      url: apiUrl
    }, applyData)
  }

  return <div className="tea_container">
    <Head>
      <title>Prices</title>
      <meta name="apple-mobile-web-app-capable" content="yes"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0,minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />  
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    </Head>
    <h3>输入茶叶的 id(多个使用英文 , 隔开)</h3>
    <div>
      <p>这个网址是：https://tweb.donghetea.com/#/pages/sale/productDetail?id=xxx</p>
      <p>可一次输入 6-8 个 id</p>
      {/* 2893,2233,2853,2671,2814,2248,2285 */}
      <textarea name="teaIds" id="" cols={30} rows={10} value={ids} onChange={onChangeHandler} />
      <p>
        <button onClick={() => onClickHandler(true)}>提交</button>
      </p>
    </div>
    <div>
      <p>这个网址是：https://www.donghetea.com/goods.php?id=xxx</p>
      {/* 2164,2459,2462,2287,2065,2066,2374,2325 */}
      <textarea name="teaIds" id="" cols={30} rows={10} value={ids} onChange={onChangeHandler} />
      <p>
        <button onClick={() => onClickHandler()}>提交</button>
      </p>
    </div>
    <h3>价格</h3>
    {
      isLoading ? <p>Loading...</p> : <table>
      <thead>
        <tr>
          <th>id</th>
          <th>批次</th>
          <th>名称</th>
          <th>价格</th>
        </tr>
      </thead>
      <tbody>
        {
          tds
        }
      </tbody>
    </table>
    }
    {
      error && <p className="error">{ error }</p>
    }
  </div>
}

export default TeaPrices