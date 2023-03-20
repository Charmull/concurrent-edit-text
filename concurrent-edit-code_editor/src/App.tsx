import "./App.css";
import CodeMirror, {
  ReactCodeMirrorRef,
  useCodeMirror,
} from "@uiw/react-codemirror";
import yorkie, { TextChange, type Text as YorkieText } from "yorkie-js-sdk";
import { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { Transaction, type ChangeSpec } from "@codemirror/state";

type YorkieDoc = {
  content: YorkieText;
};

function App() {
  const client = new yorkie.Client("https://api.yorkie.dev", {
    apiKey: "cg9v7vi1i6k1erovo3g0",
  });

  // 02-1. create a document then attach it into the client.
  const doc = new yorkie.Document<YorkieDoc>(`codemirror6`);

  // const codeMirrorTag = useRef<ReactCodeMirrorRef>(null);

  // 03-1. define function that bind the document with the codemirror(broadcast local changes to peers)
  const updateListener = EditorView.updateListener.of(viewUpdate => {
    if (viewUpdate.docChanged) {
      for (const tr of viewUpdate.transactions) {
        const events = ["select", "input", "delete", "move", "undo", "redo"];
        if (!events.map(event => tr.isUserEvent(event)).some(Boolean)) {
          continue;
        }
        if (tr.annotation(Transaction.remote)) {
          continue;
        }
        tr.changes.iterChanges((fromA, toA, _, __, inserted) => {
          // doc.update(root => {
          //   if (!root.content) {
          //     root.content = new yorkie.Text();
          //     console.log("st");
          //     root.content.edit(0, 0, inserted.toJSON().join("\n"));
          //   } else {
          //     // console.log(root.content.edit);
          //     // console.log(fromA, toA, inserted);
          //     root.content.edit(fromA, toA, inserted.toJSON().join("\n"));
          //   }
          // });
          // doc.update(root => {
          //   root.content.edit(fromA, toA, inserted.toJSON().join("\n"));
          // }, `update content byA ${client.getID()}`);
        });
      }
    }
  });

  // const editor = useRef<HTMLDivElement>(null);
  // const { setContainer } = useCodeMirror({
  //   container: editor.current,
  //   extensions: [updateListener],
  // });

  // useEffect(() => {
  //   console.log(editor.current);
  //   if (editor.current) {
  //     main();
  //     setContainer(editor.current);
  //   }
  // }, [editor.current]);

  // react codeMirror 사용X
  let editorParentElem = document.getElementById("test");
  const main = async () => {
    await client.activate();
    await client.attach(doc);
    doc.update(root => {
      if (!root.content) {
        root.content = new yorkie.Text();
      }
      // root.content = new yorkie.Text();
    });

    // // 03-1. define function that bind the document with the codemirror(broadcast local changes to peers)
    const updateListener = EditorView.updateListener.of(viewUpdate => {
      if (viewUpdate.docChanged) {
        for (const tr of viewUpdate.transactions) {
          const events = ["select", "input", "delete", "move", "undo", "redo"];
          if (!events.map(event => tr.isUserEvent(event)).some(Boolean)) {
            continue;
          }
          if (tr.annotation(Transaction.remote)) {
            continue;
          }
          tr.changes.iterChanges((fromA, toA, _, __, inserted) => {
            doc.update(root => {
              root.content.edit(fromA, toA, inserted.toJSON().join("\n"));
            }, `update content byA ${client.getID()}`);
          });
        }
      }
    });

    // // 03-2. create codemirror instance
    const view = editorParentElem
      ? new EditorView({
          doc: "",
          extensions: [basicSetup, updateListener],
          parent: editorParentElem,
        })
      : null;

    const syncText = () => {
      const text = doc.getRoot().content;
      view?.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: text.toString(),
        },
        annotations: [Transaction.remote.of(true)],
      });
    };
    doc.subscribe(event => {
      if (event.type === "snapshot") {
        // The text is replaced to snapshot and must be re-synced.
        syncText();
      }
      // displayLog(documentElem, documentTextElem, doc);
    });
    await client.sync();
    syncText();

    // console.log(view);

    const changeEventHandler = (changes: Array<TextChange>) => {
      const clientId = client.getID();
      console.log(clientId);
      const changeSpecs: Array<ChangeSpec> = changes
        .filter(
          change => change.type === "content" && change.actor !== clientId
        )
        .map(change => ({
          from: Math.max(0, change.from),
          to: Math.max(0, change.to),
          insert: change.value!.content,
        }));

      console.log(changeSpecs);
      view?.dispatch({
        changes: changeSpecs,
        // annotations: [Transaction.remote.of(true)],
      });
    };

    const text = doc.getRoot().content;
    text.onChanges(changeEventHandler);
    console.log("finish");
  };

  useEffect(() => {
    editorParentElem = document.getElementById("test");
  }, []);
  useEffect(() => {
    editorParentElem && main();
  }, [editorParentElem]);

  // useEffect(() => {
  //   console.log(codeMirrorTag);
  // }, []);

  return (
    <div className="App">
      <div id="network-status"></div>
      {/* <div ref={editor}></div> */}
      {/* <div>
        <CodeMirror
          id="codeMirrorTag"
          ref={codeMirrorTag}
          onChange={(edior, change) => {
            // console.log(change);
            // console.log(change.docChanged);
            // console.log(change.transactions);
            for (const tr of change.transactions) {
              // console.log(tr);
              // console.log(tr.changes.iterChanges);
            }
          }}
        />
      </div> */}
      <div id="test"></div>
      <div id="peers"></div>
      <div id="document"></div>
      <div id="document-text"></div>
    </div>
  );
}

export default App;
