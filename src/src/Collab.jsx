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
            username:username,
            roomId:joinedRoom
        });
        sendGroupMessage({
            content:e.target.value,
            type:'PASS',
            Pos:caretPos.current
        })
    }
    const saveFile=async()=>{
        const token=sessionStorage.getItem("jwt")
        console.log("json token ",docs)
        const promise=await fetch(`http://localhost:8080/updateDocs`,{
            method:'PUT',
            headers:{
                'Authorization':`Bearer ${token}`,
                'Content-Type':'application/json'
            },
            body:JSON.stringify(docs),
        })
        const message=await promise.json()
        console.log(message)
    }


    return (<div className="collab-wrapper">
        <div className="header">{!joinedRoom?(
        <div className="input-buttons"><input type="text" placeholder="create a new document"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}/>
        <button onClick={joinRoom}>create</button> 
        <button onClick={joinRoom}>join</button>
        </div>):(
            <button className="save-button"
            onClick={saveFile}
            >save</button>
        )}</div>
        <div>
            {joinedRoom&&(
                <div  className="editor-container" ref={containerRef}>
                    <textarea className="editor"
                    name="textarea" value={docs?.content ??""} id="1" ref={textarearef} onChange={(e)=>{handleProject(e)}}>
                        {docs?.content}</textarea>
                                <div className="mirror">{(docs?.content??"").slice(0,docs?.Pos??0)}<span className="rect" ref={markerRef}id="caret">
                                    </span>{(docs?.content??"").slice(docs?.Pos??0)}
                                    </div>
                                    {docs?.username!==username&&caret.x!==0&&caret.y!==0&&(<div className="caret1" 
                                    style={{left:`${caret.x}px`,top:`${caret.y}px`}}>|</div>)}
                                    </div>)}
                                    </div>
                                    </div>)
                                    }