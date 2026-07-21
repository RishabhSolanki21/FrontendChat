import { Target } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import './Collab.css'

export default function Collab({roomId,username,
    setRoomId,joinRoom,joinedRoom,leaveRoom,
    messagesEndRef,sendGroupMessage,handleKeyPress,docs,setDocs,setOnlineUsers,onlineUsers
}){
    const [project,setProject]=useState("");
    const [name,setName]=useState(null);

    const textarearef=useRef(null)
    const caretPos1=useRef(0)
    const caretPos2=useRef(0)
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
        // textarearef.current?.setSelectionRange(caretPos1.current,caretPos2.current)
    },[docs?.content??"",docs?.PosStart??""])

    const handleProject=(e)=>{
        console.log("e.target.selectionStart ",textarearef.current.selectionStart)
        caretPos1.current=textarearef.current.selectionStart;
        caretPos2.current=textarearef.current.selectionEnd;
        setDocs({
            content:e.target.value,
            type:'PASS',
            PosStart:caretPos1.current,
            PosEnd:caretPos2.current,
            username:username,
            roomId:joinedRoom
        });
        sendGroupMessage({
            content:e.target.value,
            type:'PASS',
            PosStart:caretPos1.current,
            PosEnd:caretPos2.current,
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
    // console.log("checking docs log => ",onlineUsers)

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
                    name="textarea" value={docs?.content ??""} id="1" ref={textarearef} onChange={(e)=>{handleProject(e)}}
                    onSelect={(e)=>{handleProject(e)}}>
                        {docs?.content}
                    </textarea>
                                <div className="mirror">{(docs?.content??"").slice(0,docs?.PosStart??0)}<span className="rect" ref={markerRef}id="caret">
                                    </span>{(docs?.content??"").slice(docs?.PosStart??0)}
                                </div>
                                <div className="selection-area">{(docs?.content??"").slice(0,docs?.PosStart??0)}<span className="selection-rect">
                                   {(docs?.content??"").slice(docs?.PosStart??0,docs?.PosEnd??0)}
                                    </span>{(docs?.content??"").slice(docs?.PosEnd??0)}
                                </div>
                        {docs?.username!==username&&caret.x!==0&&caret.y!==0&&(<div className="caret1" 
                        style={{left:`${caret.x}px`,top:`${caret.y}px`}}>|</div>)}
                </div>)}
         </div>
     </div>)
}