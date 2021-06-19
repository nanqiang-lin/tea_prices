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

  // useEffect(() => {
  //   sendRequest({
  //     url: '/api/tea/2164,2459,2462,2287,2065,2066,2374,2325'
  //   }, applyData)
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const onChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIds(e.target.value)
  }
  const onClickHandler = () => {
    if (!ids) {
      alert('请输入 id')
      return
    }
    if (isLoading) return
    sendRequest({
      url: `/api/tea/${ids}`
    }, applyData)
  }

  return <div className="tea_container">
    <h3>输入茶叶的 id(多个使用英文 , 隔开)</h3>
    <textarea name="teaIds" id="" cols={30} rows={10} value={ids} onChange={onChangeHandler} />
    <p>
      <button onClick={onClickHandler}>提交</button>
    </p>
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