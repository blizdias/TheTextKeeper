import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { Alert } from 'bootstrap';
import { set } from 'mongoose';


function Dashboard({isAdmin, onLogout}) {
    const [texts, setTexts] = useState([]); 
    const [selectedText, setSelectedText] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [editedTitle, setEditedTitle]  = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const titleInputRef = useRef(null);


    async function fetchTexts() {
        try {
            const texts = await window.electron.getTexts();
            setTexts(Array.isArray(texts) ? texts : []);
        } catch (error) {
            console.log('Failed to load texts', error);
        }
    };

    // Load texts from the JSON file into state (this should be replaced by IPC call to fetch texts)
    useEffect(() => {
     fetchTexts();
    }, []);

    const handleSelectText = (text) => {
        setIsEditing(true);
        setSelectedText(text);
        setEditedContent(text.text); 
    };

    const handleEditTitleClick = (text) => {
        setIsEditingTitle(true);
        setSelectedText(text);
        setEditedTitle(text.title);
    }

    const handleEditTitleChange = (e) => {
        if (isAdding && !isEditingTitle) {
            setNewTitle(e.target.value);
        } else {
            setEditedTitle(e.target.value);
        }
        
    };

    const handleAddNewText = () => {
        console.log('Is adding new text')
        if(!isAdding) {
            setIsAdding(true)
        }

    }

    const commitEditTitle = async () => {
        if ((isAdding && !isEditingTitle && newTitle.trim() === '') || (!isAdding && editedTitle.trim() === '')) {
            if(document.hasFocus()) {
                await window.electron.showAlert('Title cannot be empty.', 'warning');
                titleInputRef.current?.focus(); 
            }
        } else {
            try {
                if(isAdding && !isEditingTitle) {
                    const response = await window.electron.addText({
                        title: newTitle,
                        text: ''
                    });
                    fetchTexts();
                    setNewTitle('');
                    setIsAdding(false);
                    setIsEditingTitle(false); 

                } else {
                    if(editedTitle === '') {
                        await window.electron.showAlert('Title cannot be empty.', 'warning');
                        setEditedTitle(selectedText ? selectedText.title : '');

                    } else {

                        const response = await window.electron.saveTitle({
                            id: selectedText.id,
                            title: editedTitle,
                            text: selectedText.text
                        });
            
                        if(response.status === 'success') {
                            fetchTexts();
                            setNewTitle('');
                            setIsAdding(false);
                            setIsEditingTitle(false); 
                        } else {
                            console.log('Error: Text Title could not be edited.');
                        }
                    }
                }
            }
            catch (error) {
                console.log('Failed to edit Title', error);
            }
        }
    }

    const handleSaveClick = async () => {
        try {
        const response = await window.electron.saveText({
            id: selectedText.id,
            title: selectedText.title,
            text: editedContent
        });
        if (response.status === 'success') {
            fetchTexts(); 
            setIsEditing(false); 
            
        } else {
            console.error('Error: Text not found or could not be saved.');
        }
        } catch (error) {
        console.error('Failed to save text', error);
        }
    };

    const handleCopyToClipboard = async () => {
        
        console.log(editedContent)
        const response = await window.electron.copyText(editedContent);
        console.log('handle clip ok');
    }


    async function fetchTexts(search = '') {
        try {
            const textshere = await window.electron.getTexts();
            const filteredTexts = textshere.filter(text => text.title.toLowerCase().includes(search.toLowerCase()) || text.text.toLowerCase().includes(search.toLowerCase()));
            
            setIsEditing(false);

            if (filteredTexts.length === 0 && search !== '') {
                window.electron.showAlert('No texts found with the given search criteria. Please try again with different keywords.', 'warning');
            }
    
            setTexts(Array.isArray(filteredTexts) ? filteredTexts : []);
            
        } catch (error) {
            console.log('Failed to load texts', error);
        }
    };
    

    return (
        <div className="dashboard">
        <header className="header">
            <h1 className="dashboard-title">The text keeper</h1>
            <div className="actions">
            <button 
                onClick={onLogout} 
                className="button" >
                Logout
            </button>
            </div>
        </header>
        <div className="search-container">
            <input
                type="text"
                placeholder="Search texts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => fetchTexts(searchTerm)}>Search</button>
        </div>
        <div className="main-content">
            <ul className="text-list">
            {texts.length > 0 ? (
                texts.map((text) => (
                    <li
                        key={text.id}
                        className={`text-item ${selectedText && selectedText.id === text.id ? 'selected' : ''}`}
                        onClick={() => handleSelectText(text)}
                        onDoubleClick={() => handleEditTitleClick(text)}
                    >
                        {isAdmin() && selectedText && isEditingTitle && selectedText.id === text.id ? (
                            <input
                                ref={titleInputRef}
                                type = "text"
                                value={editedTitle}
                                onChange={handleEditTitleChange}
                                onBlur={commitEditTitle}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        commitEditTitle()
                                    }
                                }}
                                autoFocus
                                />
                        ) : (
                            text.title
                        )}
                    </li>
                ))
                ) : (
                <li className='text-item empty'>No texts available.</li>
            )}

                {isAdding && !isEditingTitle ? (
                    <input
                        ref={titleInputRef}
                        type = "text"
                        value={newTitle}
                        onChange={handleEditTitleChange}
                        onBlur={commitEditTitle}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                commitEditTitle()
                            }
                        }}
                        autoFocus
                        />
                ) : null}
                {isAdmin() && !isAdding ? (
                 (
                    <div className="actions">
                    <button 
                        className="button" 
                        onClick={() => handleAddNewText()}>
                    Add New Text
                    </button>
                    </div>
                )   
                ) : null}

            </ul>
            {isEditing && selectedText && (
            <div className="edit-box">
                {
                    isAdmin() ? 
                    (
                        <textarea
                        className="edit-textarea"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        />
                    ) : (
                        <div className="edit-textarea">{selectedText.text}</div>
                    )
                }
                
                <div className='actions'>
                    {
                        isAdmin() ? (
                        <button className="button save-button" onClick={handleSaveClick}>
                        Save Changes
                        </button>
                        ) : null
                    }
                    
                    <button className="button copy-button margin-left-10" onClick={handleCopyToClipboard}>
                    Copy Text
                    </button>
                </div>   
            </div>
            )}
        </div>
        </div>
    );
}

export default Dashboard;
