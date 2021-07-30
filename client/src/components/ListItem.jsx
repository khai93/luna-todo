import React from 'react';

export function ListItem(props) {
    const fetchList = props.fetchList;
    const itemData = props.item;
    const itemKey = "list-item-" + itemData.id;

    function deleteItem() {
        fetch("http://localhost:5000/gateway/services/List/api/list/1/items/" + itemData.id, { method: "DELETE" })
            .then(() => {
                console.log("Deleted Successfully");
                fetchList();
            });
    }

    return (
        <div className="list-item">
            <label for={itemKey}>
                { itemData.message }
            </label>
            <input type="checkbox" id={itemKey} name={itemKey} value={itemData.id} onChange={deleteItem}></input>
        </div>
    )
}

