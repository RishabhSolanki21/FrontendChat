import { useEffect, useLayoutEffect, useRef, useState } from "react"
import './Collab.css'

export default function Collab({roomId,username,
    setRoomId,joinRoom,joinedRoom,leaveRoom,
    messagesEndRef,sendGroupMessage,handleKeyPress,docs,setDocs,setOnlineUsers,onlineUsers,sendCaret
}){
    const [project,setProject]=useState("");
    const [name,setName]=useState(null);

    const textarearef=useRef(null)
    const caretPos1=useRef(0)
    const caretPos2=useRef(0)
    const [remotecaret, setremoteCaret]=useState({x:0,y:0})
    const markerRef=useRef({})
    const containerRef=useRef(null)

    useLayoutEffect(()=>{
        const newCaret={}
        // console.log("marker ref ",markerRef)
        Object.entries(markerRef.current).forEach(([name,mref])=>{
            const rect=mref.getBoundingClientRect()
        const contRect=containerRef.current?.closest('.editor-container')?.getBoundingClientRect()
        // console.log("rect ",rect??"null")
        newCaret[name]=({
            x:rect&&contRect ? rect.left-contRect.left:0,
            y:rect&&contRect ? rect.top-contRect.top:0
        })
    })
    console.log("newcaret ",newCaret)
    setremoteCaret(newCaret)
        
    },[onlineUsers])
    textarearef.current?.setSelectionRange(caretPos1.current,caretPos2.current)
    const handleProject=(e)=>{
        // console.log("e.target.selectionStart ",textarearef.current.selectionStart)
        console.log("callign handle project method")
        caretPos1.current=textarearef.current.selectionStart;
        caretPos2.current=textarearef.current.selectionEnd;
        console.log("checking caret pos in handle project ",caretPos1.current,caretPos2.current)
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
    const handleCaret=(e)=>{
        console.log("calling handle caret method")
        caretPos1.current=textarearef.current.selectionStart;
        caretPos2.current=textarearef.current.selectionEnd;
        console.log("checking caret pos in handle Caret ",caretPos1.current,caretPos2.current)
        sendCaret({
            PosStart:caretPos1.current,
            PosEnd:caretPos2.current
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
    // console.log("checking docs log2 => ",Array.isArray(onlineUsers))

    return (<div className="collab-wrapper">
        <div className="header">{!joinedRoom?(
        <div className="input-buttons"><input type="text" placeholder="create a new document"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}/>
        <button onClick={joinRoom}>create</button> 
        <button onClick={joinRoom}>join</button>
        </div>):(
        <div className="collab-header">
                 <div className="tracking-container"> { onlineUsers!=null ?(
                Object.entries(onlineUsers).map(([username,users])=>(
                    <div className="online-users" key={username}>{users.username}</div>
                ))
            ):(
                <div>no users</div>
            )}</div> 
             <div className="save-container"><button className="save-button"
            onClick={saveFile}
            >save</button></div>
            </div>
        )}</div>
        <div>
            {joinedRoom&&(
                <div  className="editor-container" ref={containerRef}>
                
                    <textarea className="editor"
                    name="textarea" value={docs?.content ??""} id="1" ref={textarearef} onChange={(e)=>{handleProject(e)}}
                    // onKeyDown={(e)=>{handleCaret(e)}}
                    // onKeyUp={(e)=>{handleCaret(e)}}
                    // onClick={(e)=>{handleCaret(e)}}
                    onSelect={(e)=>{handleCaret(e)}}>
                        {docs?.content}
                    </textarea>
                    {Object.entries(onlineUsers).map(([onlineuser,users])=>{
                        // console.log("qwertyu ",users)
                      return  <div key={onlineuser}>
                            <div className="mirror">{(docs?.content??"").slice(0,users?.caret?.PosStart??0)}<span className="rect" 
                            ref={el=>{markerRef.current[onlineuser]=el}}id="caret">
                                    </span>{(docs?.content??"").slice(users?.caret?.PosStart??0)}
                                </div>
                                <div className="selection-area">{(docs?.content??"").slice(0,users?.caret?.PosStart??0)}<span className="selection-rect">
                                   {(docs?.content??"").slice(users?.caret?.PosStart??0,users?.caret?.PosEnd??0)}
                                    </span>{(docs?.content??"").slice(users?.caret?.PosEnd??0)}
                                </div>
                        {onlineuser!==username&&remotecaret[onlineuser]?.x!==0&&remotecaret[onlineuser]?.y!==0&&(
                            <div className="caret1" style={{left:`${remotecaret[onlineuser]?.x}px`,top:`${remotecaret[onlineuser]?.y}px`,
                              backgroundColor:`hsl(${12},70%,50%)`
                        }}>|</div>)}</div>
                    })
                                
            }

                </div>)}
         </div>
     </div>)
}