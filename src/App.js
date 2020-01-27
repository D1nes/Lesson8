import React, { useState, Fragment } from "react";
import { values } from "mobx";
import { observer } from "mobx-react";
import { Link, Route } from "react-router-dom";
import "./App.css";
import Favorite from "./components/Favorite/Favorite";
import GroupList from "./components/GroupList/GroupList";
import TodoList from "./components/TodoList/TodoList";
import store from "./stores/RootStore";

function App() {
  const [newGroup, setNewGroup] = useState("");

  const onSubmit = () => {
    store.groups.add(newGroup);
    document.getElementById("inputGroup").value = "";
  };

  return (
    <div className="mainBlock">
      <div className="groupBlock">
        <Link to="/favorite">Favorite </Link>
        <hr />
        <input
          id="inputGroup"
          onChange={event => setNewGroup(event.target.value)}
        />
        <button onClick={onSubmit}>Add</button>
        <hr />
        <ul>
          {values(store.groups.list).map(group => (
            <Fragment key={group.id}>
              <GroupList group={group} />
            </Fragment>
          ))}
        </ul>
      </div>
      <Route path="/favorite" component={Favorite} />
      <Route path="/todo" component={TodoList} />
    </div>
  );
}

export default observer(App);
