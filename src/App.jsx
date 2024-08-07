import { useEffect, useRef, useState } from "react";
import "./components/Message";
import Message from "./components/Message";
import {
  Box,
  Container,
  HStack,
  VStack,
  Input,
  Button,
} from "@chakra-ui/react";

import { app } from "./firebase";
import {
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  collection,
  getFirestore,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

//authenticaton
const loginHandler = () => {
  const googleAuthProvider = new GoogleAuthProvider();
  signInWithPopup(auth, googleAuthProvider);
};

const logoutHandler = () => {
  signOut(auth);
};

const App = () => {
  const q = query(collection(db, "Messages"), orderBy("createdAt", "asc"));
  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const divForScroll = useRef(null);

  //save to db
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setMessage(" ");
      await addDoc(collection(db, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),
      });

      divForScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });

    const unsubscribeForMsg = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() };
        })
      );
    });

    return () => {
      unsubscribe();
      unsubscribeForMsg();
    };
  }, []);

  return (
    <Box bg={"#FBD38D"}>
      {user ? (
        <Container h={"100vh"} bg={"white"}>
          <VStack h={"100%"}>
            <Button
              onClick={logoutHandler}
              _hover={{ bg: "#FEEBC8" }}
              bg={"#DD6B20"}
              w={"90%"}
              marginX={"2rem"}
              marginY={"0.5rem"}
            >
              Logout
            </Button>
            <VStack
              h={"full"}
              w={"full"}
              overflowY={"auto"}
              css={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {messages.map((item) => (
                <Message
                  key={item.id}
                  user={item.uid === user.uid ? "me" : "other"}
                  text={item.text}
                  uri={item.uri}
                />
              ))}

              <div ref={divForScroll}></div>
            </VStack>
            <form onSubmit={submitHandler} style={{ width: "100%" }}>
              <HStack marginY={"1rem"}>
                <Input
                  placeholder="Enter a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" colorScheme="purple">
                  Send
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack h={"100vh"} justifyContent={"center"}>
          <Button onClick={loginHandler} colorScheme="purple">
            Sign in with Google
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default App;
