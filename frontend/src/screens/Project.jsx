import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios.jsx';
import { useUser } from '../context/user.context.jsx'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket.jsx';
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer.js';

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}


function Project() {
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState({});
  const [message, setMessage] = useState('');
  const { user } = useUser();
  const messageBox = useRef(null);
  const [messages, setMessages] = useState([]);  // All Messages 
  const [currentFile, setCurrentFile] = useState(null); //selected file
  const [openFiles, setOpenFiles] = useState([]);  //Opened files
  const [fileTree, setFileTree] = useState({});
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');



  useEffect(() => {
    const projectId = location.state.project._id;
    axios.get(`/projects/get-project/${projectId}`)
      .then((res) => {
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree);
      })
      .catch((err) => {
        console.log(err);
      });

    axios.get('/users/all')
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [project._id]);


  useEffect(() => {
    if (project._id) {
      // Socket connection
      const socket = initializeSocket(project._id);

      if (!webContainer) {
        getWebContainer().then(container => {
          setWebContainer(container);
          console.log('WebContainer initialized');
        })
      }


      receiveMessage('project-message', async data => {

        if (data.sender._id == 'ai') {
          const parseedMessage = JSON.parse(data.message);

          if (parseedMessage.fileTree) {
            await webContainer?.mount(parseedMessage.fileTree)
            setFileTree(parseedMessage.fileTree);

          }
        }
        console.log('Message Recieved');
        setMessages(prev => [...prev, { ...data, type: 'incoming' }]);
        scrollToBottom();
      });

      // Clean up socket connection on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [project]); // Only run when project changes


  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const AddCollabortors = () => {
    const projectId = location.state.project._id;
    axios.put('/projects/add-user', { projectId, users: selectedUsers })
      .then((res) => {
        console.log("Added Collaborators:", res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const send = () => {
    if (message.trim() === "") return;
    const messageData = {
      message,
      sender: user,
      type: 'outgoing'
    };

    console.log('Sending Message');
    sendMessage('project-message', messageData);

    // Add message to state instead of DOM
    setMessages(prev => [...prev, messageData]);
    scrollToBottom();
    setMessage('');
  }

  //function to scroll to bottom
  const scrollToBottom = () => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  };

  function WriteAiMessage(message) {

    const messageObject = JSON.parse(message)

    return (
      <div
        className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
      >
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>)
  }

  const saveFileTree = (ft) => {
    axios.put('/projects/update-file-tree', {
      projectId: project._id,
      fileTree: ft
    }).then(res => {
      console.log("File Tree Saved", res.data);
    }).catch(err => {
      console.log(err);
    })
  }

  const deleteFile = (file) => {
    axios.delete('/projects/delete-file', {
      params: {
        projectId: project._id,
        file
      }
    }).then(res => {
      console.log(res.data);
      if (res.data) {
        // Remove file from fileTree
        const updatedFileTree = { ...fileTree };
        delete updatedFileTree[file];


        if (Object.keys(updatedFileTree).length === 0) { // if fileTree is empty
          setFileTree({});
          setOpenFiles([]);
          setCurrentFile(null);
        } else {
          setFileTree(updatedFileTree);
          // Remove file from openFiles if it's open
          if (openFiles.includes(file)) {
            setOpenFiles(openFiles.filter(f => f !== file));
          }
          // If current file is the deleted file, set currentFile to first available file
          if (currentFile === file) {
            const remainingFiles = Object.keys(updatedFileTree);
            setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
          }
        }
      }
    }).catch(err => {
      console.log(err);
    });
  }


  const createFile = () => {
    if (!newFileName.trim()) return;

    const updatedFileTree = {
      ...fileTree,
      [newFileName]: {
        file: {
          contents: ''
        }
      }
    };

    setFileTree(updatedFileTree);
    setOpenFiles([...openFiles, newFileName]);
    setCurrentFile(newFileName);
    setNewFileName('');
    setIsNewFileModalOpen(false);

    // Save to backend
    saveFileTree(updatedFileTree);
  };



  return (
    <main className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Left Section */}
      <section className={`left flex flex-col h-screen ${!fileTree || Object.keys(fileTree).length === 0 ? 'w-full' : 'min-w-96'} bg-white/80 backdrop-blur-sm shadow-lg relative`}>
        {/* Header */}
        <header className="flex justify-between items-center p-3 px-4 w-full absolute bg-white/90 backdrop-blur-sm border-b border-gray-200 z-10">
          <button
            className="flex gap-2 items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-300"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-add-fill text-blue-600"></i>
            <p className="text-gray-700">Add collaborator</p>
          </button>

          <button
            className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-all duration-300"
            onClick={() => {
              setIsSidePanelOpen(!isSidePanelOpen)
            }}
          >
            <i className="ri-group-fill text-xl"></i>
          </button>
        </header>

        {/* Conversation Area */}
        <div className="conversation-area flex flex-col h-screen pt-16 pb-20">
          <div className="flex-grow flex flex-col overflow-hidden p-4">
            <div
              ref={messageBox}
              className="message-box flex-grow overflow-y-auto space-y-3 pr-2"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${msg.type === 'outgoing' ? 'ml-auto' : ''} ${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-56'} flex flex-col p-3 rounded-xl shadow-sm ${msg.type === 'outgoing' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}
                >
                  <small className="opacity-75 text-xs mb-1">
                    {msg.sender.email}
                  </small>
                  {msg.sender._id === 'ai' ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p className="text-sm">{msg.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="inputField absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
            <div className="flex gap-2 bg-white rounded-lg shadow-sm">
              <input
                className="flex-grow p-3 rounded-l-lg focus:outline-none"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                className="p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors duration-300"
                onClick={send}
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-white/95 backdrop-blur-md shadow-2xl absolute transition-transform duration-300 ease-in-out ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 z-50`}>
          <header className="flex justify-between items-center p-4 bg-white border-b border-gray-100">
            <h1 className="font-semibold text-gray-800">Collaborators</h1>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </header>

          <div className="user-list flex flex-col gap-3 p-4">
            {project.users && project.users.map(user => (
              <div
                key={user._id}
                className="user flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="aspect-square w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="ri-user-fill text-blue-600"></i>
                </div>
                <h1 className="font-medium text-gray-700">{user.email}</h1>
              </div>
            ))}
          </div>
        </div>



      </section>

      {/* Right Section */}
      {fileTree && Object.keys(fileTree).length > 0 && (

        <section className="right flex flex-grow h-full overflow-hidden">

          <div className='explorer h-full max-w-64 min-w-52 bg-gray-800'>
            <div className="file-tree-header flex justify-between items-center p-2 border-b border-gray-600">
              <h2 className="font-semibold text-white">Files</h2>
              <button
                onClick={() => setIsNewFileModalOpen(true)}
                className="p-1 hover:bg-gray-700 rounded-md"
              >
                <i className="ri-add-line text-xl text-white"></i>
              </button>
            </div>
            <div className="file-tree w-full h-full">
              {
                Object.keys(fileTree).map((file, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentFile(file);
                      if (!openFiles.includes(file)) {
                        setOpenFiles([...openFiles, file]);
                      }
                    }}
                    className="tree-element w-full p-2 px-4 flex items-center gap-2 cursor-pointer hover:bg-gray-700 rounded-md"
                  >
                    <p className="font-semibold text-lg text-white">
                      {file}
                    </p>
                    <i
                      className="ri-close-circle-line text-xl ml-auto text-white hover:bg-gray-600 rounded-lg"
                      onClick={(e) => deleteFile(file)}
                    ></i>
                  </button>
                ))
              }
            </div>
          </div>


          <div className='code-editor flex flex-col flex-grow h-full shrink'>

            <div className="top flex justify-between w-full bg-gray-800">

              <div className="files flex">
                {
                  openFiles.map((file, index) => (
                    <button key={index}
                      onClick={() => { setCurrentFile(file) }}
                      className="open-file w-fit p-2 px-4 flex items-center gap-2 cursor-pointer hover:bg-gray-700 rounded-md">
                      <p
                        className='font-semibold text-lg text-white'
                      >
                        {file}
                      </p>
                    </button>
                  ))
                }
              </div>

              <div className="actions flex gap-2">
                <button
                  onClick={async () => {
                    await webContainer.mount(fileTree);
                    const installProcess = await webContainer.spawn("npm", ["install"])

                    installProcess.output.pipeTo(new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      }
                    }))

                    if (runProcess) {
                      runProcess.kill();
                      setRunProcess(null);
                    }

                    let tempRunProcess = await webContainer.spawn("npm", ["start"])

                    tempRunProcess.output.pipeTo(new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      }
                    }))

                    setRunProcess(tempRunProcess);

                    webContainer.on('server-ready', (port, url) => {
                      console.log('Server is running at port:', port, url);
                      setIframeUrl(url);
                    })

                  }}
                  className='p-2 px-4 cursor-pointer bg-gray-700 text-blue-400 rounded-md'
                >
                  run
                </button>

              </div>


            </div>
            <div className="bottom flex flex-grow overflow-auto shrink ">
              {
                fileTree[currentFile] && (
                  <div className="code-editor-area h-full overflow-auto flex-grow bg-gray-900">
                    <pre
                      className="hljs h-full bg-gray-900 text-white"
                      style={{
                        backgroundColor: '#2d2d2d', // Lighter dark background
                        color: '#e0e0e0', // Lighter text color
                      }}
                    >
                      <code
                        className="hljs h-full outline-none text-white"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updatedContent = e.target.innerText;
                          const ft = {
                            ...fileTree,
                            [currentFile]: {
                              file: {
                                contents: updatedContent,
                              },
                            },
                          };
                          setFileTree(ft);
                          saveFileTree(ft);
                        }}
                        dangerouslySetInnerHTML={{
                          __html: hljs.highlight(fileTree[currentFile].file.contents, {
                            language: 'javascript',
                            ignoreIllegals: true,
                          }).value,
                        }}
                        style={{
                          backgroundColor: '#1e1e1e', // Enforce background
                          color: '#dcdcdc', // Enforce syntax color
                          whiteSpace: 'pre-wrap',
                          paddingBottom: '25rem',
                          counterSet: 'line-numbering',
                        }}
                      />
                    </pre>
                  </div>
                )
              }
            </div>


          </div>

          {iframeUrl && webContainer &&
            <div className='flex flex-col h-full min-w-96 bg-white'>

              <div className='address-bar'>
                <input type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl}
                  className='outline-none w-full p-2 px-4 bg-gray-700 text-white border border-black rounded-b-lg'
                />

              </div>
              <iframe src={iframeUrl} className='w-full h-full'></iframe>
            </div>
          }

        </section>

      )}





      {/* User Selection Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-gray-100 opacity-70 z-40"></div>

          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Select Users</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {users.map(user => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user._id)}
                    className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors ${selectedUsers.includes(user._id)
                      ? 'bg-indigo-50 border-2 border-indigo-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <i className="ri-user-fill text-gray-600"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                    {selectedUsers.includes(user._id) && (
                      <i className="ri-check-line ml-auto text-indigo-600 text-xl"></i>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      AddCollabortors();
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Add Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}


      {/* New File Modal */}
      {isNewFileModalOpen && (
        <>
          <div className="fixed inset-0 bg-gray-100 opacity-70 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Create New File</h2>
                  <button
                    onClick={() => setIsNewFileModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                createFile();
              }}>
                <div className="p-4">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter file name (e.g. index.js)"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsNewFileModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default Project;