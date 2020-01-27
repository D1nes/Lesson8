import React from "react";
import store from '../../stores/RootStore'
import {values} from "mobx";


const Favorite = () => {

    return (
        <ul>
            {
                values(store.todos.list).map(data => {
                    if (data.isFavorite) {
                         return (
                             <li className={data.isCompleted ? "complited" : null}>
                                 {data.title}
                             </li>
                         )
                    } else  return null
                })
            }

        </ul>
    )
}

export default Favorite
