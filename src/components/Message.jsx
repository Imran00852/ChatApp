import { HStack, Text, Avatar } from "@chakra-ui/react";
const Message = ({ text, uri, user = "other" }) => {
  return (
    <HStack
      alignSelf={user === "me" ? "flex-end" : "flex-start"}
      borderRadius={"base"}
      bgColor={"#EBF8FF"}
      paddingX={"3"}
      paddingY={"2"}
    >
      {user==="other" && <Avatar src={uri} />}
      <Text>{text}</Text>
      {user==="me" && <Avatar src={uri} />}
      
    </HStack>
  );
};

export default Message;
