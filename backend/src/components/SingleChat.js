import React, { useEffect, useState } from 'react'

import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon} from "@chakra-ui/icons";
import { getSender, getSenderFull} from '../config/ChatLogics';
import ProfileModel from './miscellaneous/ProfileModel';
import { ChatState } from '../context/ChatProvider';
import UpdateGroupChatModel from './miscellaneous/UpdateGroupChatModel';
import axios from 'axios';
import './style.css'
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';
import Lottie, { } from 'react-lottie';
import animationData from "../animations/typing.json"

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ( fetchAgain, setFetchAgain) => {

  const [message, setMessage] = useState([]);
  const [loading, setLoading ] = useState(false);
  const [newMessage, setNewMessage ] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping ] = useState(false);
  const [isTyping, setIsTyping ] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loot: true,
    autoplay: true,
    animationData:animationData,
    rendererSettings: {
      preserveAspectRation:"xMidYMid slice",
    },
  };

  const { user , selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  const fetchMessage = async () => {
    if(!selectedChat) return;
    try {
      const config = {
        headers:{
          
          Authorization: `Bearer ${user.token}`,
      },
    };
    setLoading(true);
    const { data } = await axios.get(
      `/api/message/${selectedChat._id}`,
       config
      );
      // console.log(message);
      setMessage(data);
      setLoading(false);
      socket.emit('join chat', selectedChat._id);
    } catch (error) {
      toast({
        title:"Error Occured!",
          description:"Failed to Load the chats",
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom-left",
        });
    }
  };
  
  useEffect(() => {
  socket = io(ENDPOINT);
  socket.emit('setup', user);
  socket.on('connected', () => setSocketConnected(true));
  socket.on("typing", () => setIsTyping(true))
  socket.on('stop typing', () => setIsTyping(false));
  }, []);


  useEffect(() => {
   fetchMessage();
   selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // console.log(notification, '-------------');


  useEffect(() => {
  socket.on('message recieved',(newMessageRecieved) => {
    if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id)
      {
      //give notification 
        if(!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          // setFetchAgain(!fetchAgain);
        };
     
    } else{
      setMessage([...message, newMessageRecieved]);
    }
  });
  });
    
  const  sendMessage = async (e) => {
    if(e.key === "Enter" && newMessage){
      socket.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers:{
            "Content-Type":"application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        
        setNewMessage("");
        const { data } = await axios.post('/api/message', 
        {
          content: newMessage,
          chatId:selectedChat._id,
        },
      config
      );

      

      socket.emit('new message', data)
      setMessage([...message, data]);
      } catch (error) {
        toast({
          title:"Error Occured!",
          description:"Failed to Send the chats",
          status:"error",
          duration:5000,
          isClosable:true,
          position:"bottom-left",
        });
      }
    }
  };

 

  const  typingHandler = (e) => {
    setNewMessage(e.target.value);
      
    //Typing indicator logic
    if(!socketConnected) return;
    if(!typing){
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime()
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if(timeDiff >= timerLength && typing){
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }

    },timerLength);
  }

  return (
    <>
     {selectedChat ? (
        <>
        <Text
        fontSize={{ base: "25px", md:"30px"}}
        pb={3}
        px={2}
        w="100%"
        fontFamily="Work sans"
        display="flex"
        justifyContent={{ base:"space-between"}}
        alignItems="center"
        >

          <IconButton
          display={{ base:"flex" , md:"none" }}
          icon={<ArrowBackIcon/>}
          onClick={() => setSelectedChat("")}
          />

          {!selectedChat.isGroupChat ? (
            <>
            {getSender(user, selectedChat.users)}
            <ProfileModel
            user={getSenderFull(user,selectedChat.users)}
            />
            </>
          ):(
            <>
             {selectedChat.chatName.toUpperCase()}
             <UpdateGroupChatModel
             fetchAgain={fetchAgain}
             setFetchAgain={setFetchAgain} 
             fetchMessage={fetchMessage}
             />
            </>

          )}

        </Text>
          <Box
          display="flex"
          flexDir='column'
          justifyContent="flex-end"
          p={3}
          background="#E8E8E8"
        // background="yellow.200"
          w="100%"
          h="100%"
          borderRadius="lg"
          overflow="hidden"
          >
            {/* Message Here */}
            {loading ? (
              <Spinner 
              size="xl"
              w={10}
              h={10}
              alignSelf="center"
              margin="auto"
            />
            ): (
              <div className='message'>
              {/* Messages */}
              <ScrollableChat  message={message}/>
              </div>
            )}

            <FormControl
            onKeyDown={sendMessage}
            isRequired
            mt={3}
            >
              {isTyping ? <div>
                
                <Lottie 
                options={defaultOptions}
                width={60}
                style={{marginBottom:15, marginLeft: 10}}
                />
                
                </div>: <></>}
              <Input variant="filled"
              background="#E0E0E0"
              placeholder='Enter a message..'
              onChange={typingHandler}
              value={newMessage}
              />
            </FormControl>

          </Box>
        
        </>
     ):(
        <Box display="flex" alignItems="center" justifyContent="center" h="100%" >
            <Text fontSize="25px" pb={3} fontFamily="Work sans">
                Click on user to start chatting
            </Text>

        </Box>

     )}

    </>
  )
}

export default SingleChat
