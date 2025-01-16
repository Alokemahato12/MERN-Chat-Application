import React, { use, useEffect } from 'react'
import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

const Homepage = () => {
  
  const history = useHistory();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
   
    if(user) {
        history.push('/');
    }
    }, [history]);
  return (
    <Container maxW="xl" centerContent>
      <Box
      display="flex"
      justifyContent="center"
      p={0}
      w="100%"
      m="3px 0 11px 0"
      background={"white"}
      borderRadius="lg"
      borderWidth="1px"

      >
        <Text fontSize="2xl" fontFamily="Work sans">
          Talk-A-Tive
          </Text>
      </Box>

      <Box 
      background="white"
      w="100%"
      p={0}
      borderRadius="lg"
      borderWidth="1px"
      >
        <Tabs variant="soft-rounded" >
        <TabList mb='1em'>
            <Tab width="50%">Login</Tab>
            <Tab width="50%">Sign up</Tab>
        </TabList>
        <TabPanels>
        <TabPanel>
            <Login/>
        </TabPanel>
        <TabPanel>
            <Signup/>
          </TabPanel>
        </TabPanels>
           </Tabs>
      </Box>
    </Container>
  )
}

export default Homepage;
