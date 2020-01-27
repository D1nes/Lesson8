import React, {useState} from 'react'
import { observer } from "mobx-react";
import {Link} from "react-router-dom";

const GroupList = ({ group }) => {

    return (
        <>
            {
                (<Link to={`/todo?id=${group.id}`}>
                    <li>
                        {group.title}
                    </li>
                </Link>
                )
            }
        </>
    )
}

export default observer(GroupList)
