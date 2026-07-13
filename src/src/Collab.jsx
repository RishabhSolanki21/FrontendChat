import { Target } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import './Collab.css'

export default function Collab({roomId,username,
    setRoomId,joinRoom,joinedRoom,leaveRoom,
    messagesEndRef,sendGroupMessage,handleKeyPress,docs,setDocs
}){
    const [project,setProject]=useState("");
    const [name,setName]=useState(null);

    const textarearef=useRef(null)
    const caretPos=useRef(0)
    const [caret, setCaret]=useState({x:0,y:0})
    const markerRef=useRef(null)
    const containerRef=useRef(null)


    useLayoutEffect(()=>{
        const rect=markerRef.current?.getBoundingClientRect();
        const contRect=containerRef.current?.closest('.editor-container')?.getBoundingClientRect()
        console.log("rect ",rect??"null")
        setCaret({
            x:rect&&contRect ? rect.left-contRect.left:0,
            y:rect&&contRect ? rect.top-contRect.top:0
        })
        textarearef.current?.setSelectionRange(caretPos.current,caretPos.current)//? means run if not null
    },[docs?.content??"",docs?.Pos??""])

    const handleProject=(e)=>{
        console.log("e.target.selectionStart ",e.target.selectionStart)
        caretPos.current=textarearef.current.selectionStart;
        setDocs({
            content:e.target.value,
            type:'PASS',
            Pos:caretPos.current,
            username:username
        });
        sendGroupMessage({
            content:e.target.value,
            type:'PASS',
            Pos:caretPos.current
        })
    }
    const saveFile=()=>{
        sendGroupMessage({
            content:docs,
            type:'PROJECT',
            username:username,
            roomId:joinedRoom
        })
    }


    return (<div>
        {!joinedRoom?(
        <div><input type="text" placeholder="create a new document"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}/>
        <button onClick={joinRoom}>create</button> 
        <button onClick={joinRoom}>join</button>
        </div>):(
        <div  className="editor-container" ref={containerRef}>
        <textarea className="editor"
        name="textarea" value={docs?.content ??""} id="1" ref={textarearef} onChange={(e)=>{handleProject(e)}}
        >{docs?.content}</textarea>
        <button onClick={saveFile}>save docs</button>
        <div className="mirror">{(docs?.content??"").slice(0,docs?.Pos??0)}<span className="rect" ref={markerRef}id="caret">
            </span>{(docs?.content??"").slice(docs?.Pos??0)}
        </div>
        {docs?.username!==username&&caret.x!==0&&caret.y!==0&&(<div className="caret1" style={{
            left:`${caret.x}px`,
            top:`${caret.y}px`
        }}>|</div>)}
        </div>)}
    </div>)
}