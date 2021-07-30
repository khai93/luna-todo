import React, { useEffect, useState } from 'react';
import './App.css';
import { ListItem } from './components/ListItem';

function App() {
  const [input, setInput] = useState("");
  const [list, setList] = useState({});

  function handleCreate() {
       fetch("http://localhost:5000/gateway/services/List/api/list/1/createItem", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ todo_desc: input }) })
            .then(data => {
                console.log("Created Item.");
                setInput("");
                fetchList();
            })
            .catch(err => {
               console.error(err);
            })
  }

  async function fetchList() {
      fetch("http://localhost:5000/gateway/services/List/api/list/1")
        .then(data => data.json())
        .then(data => {
            setList(data);
        })
        .catch(err => {
          console.error(err);
        })
  }

  useEffect(() => {
      fetchList();
  }, []);

  return (
    <div className="App">
      <input type="text" placeholder="Todo Description" value={input} onChange={(e) => setInput(e.target.value)}></input>
      <button onClick={handleCreate}>Create Item</button>

      <div>
        {
          list && list.items && list.items.map((item, id) => <ListItem key={id} fetchList={fetchList} item={{id, message: item[0], is_done: item[1]}}></ListItem>)
        }
      </div>

    </div>
  );
}

export default App;
