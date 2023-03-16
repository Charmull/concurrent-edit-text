import logo from "./logo.svg";
import "./App.css";
import yorkie from "yorkie-js-sdk";
import { useEffect } from "react";

function App() {
  const client = new yorkie.Client("https://api.yorkie.dev", {
    apiKey: "cg96lvi1i6k1erovlodg",
  });

  const doc = new yorkie.Document("concorrent-edit-text");

  let editor = document.getElementById("editor");

  const main = async () => {
    await client.activate();

    await client.attach(doc);

    doc.update(root => {
      // console.log(root.text);
      if (root.text) {
        editor.value = root.text;
      } else {
        root.text = "Edit";
      }
    });

    doc.subscribe(event => {
      if (event.type === "remote-change") {
        editor.value = doc.getRoot().text;
      }
    });
  };

  const editorHandler = event => {
    doc.update(root => {
      root.text = event.target.value;
    });
  };

  useEffect(() => {
    editor = document.getElementById("editor");
  }, []);

  useEffect(() => {
    editor && main();
  }, [editor]);

  return (
    <div className="App">
      <input id="editor" onInput={editorHandler}></input>
    </div>
  );
}

export default App;
