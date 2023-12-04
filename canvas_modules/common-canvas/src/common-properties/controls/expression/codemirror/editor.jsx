import React, { useRef, useEffect, useState } from "react";
// import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { basicSetup, EditorView } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";


export const Editor = () => {
	const editor = useRef();
	const [code, setCode] = useState("");

	const onUpdate = EditorView.updateListener.of((viewUpdate) => {
		console.log("Update listener called!");
		console.log(viewUpdate.state.doc.toString());
		setCode(viewUpdate.state.doc.toString());
		console.log(code);
	});

	useEffect(() => {
		// const startState = EditorState.create({
		// 	doc: "Hello World",
		// 	extensions: [basicSetup, javascript(), keymap.of([defaultKeymap, indentWithTab]), onUpdate]
		// });

		const view = new EditorView({
			// state: startState,
			doc: "console.log('hello')\n",
			extensions: [basicSetup, javascript(), keymap.of([defaultKeymap, indentWithTab]), onUpdate],
			parent: editor.current
		});

		return () => {
			view.destroy();
		};
	}, []);

	return <div ref={editor} />;
};
