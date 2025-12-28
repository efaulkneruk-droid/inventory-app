import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export default function App(){
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)

  const load = async ()=>{
    const res = await axios.get(`${API}/api/items`)
    setItems(res.data)
  }

  useEffect(()=>{ load() }, [])

  const add = async (e) =>{
    e.preventDefault()
    await axios.post(`${API}/api/items`, { name, quantity })
    setName('')
    setQuantity(1)
    load()
  }

  const remove = async (id) =>{
    await axios.delete(`${API}/api/items/${id}`)
    load()
  }

  return (
    <div style={{padding:20,fontFamily:'sans-serif'}}>
      <h1>Inventory</h1>
      <form onSubmit={add} style={{marginBottom:10}}>
        <input placeholder="name" value={name} onChange={e=>setName(e.target.value)} required />
        <input type="number" style={{width:80,marginLeft:8}} value={quantity} onChange={e=>setQuantity(Number(e.target.value))} />
        <button style={{marginLeft:8}}>Add</button>
      </form>
      <ul>
        {items.map(it=> (
          <li key={it.id} style={{marginBottom:6}}>
            <strong>{it.name}</strong> — {it.quantity}
            <button onClick={()=>remove(it.id)} style={{marginLeft:8}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
