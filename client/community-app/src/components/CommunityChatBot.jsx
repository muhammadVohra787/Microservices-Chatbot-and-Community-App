import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Avatar,
    TextField,
    IconButton,
    Typography,
    Modal,
    Backdrop,
    Fade,
    Button,
    Divider,
    CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ReactMarkdown from "react-markdown";
import { gql, useQuery } from "@apollo/client";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useNavigate } from "react-router-dom";
const GET_CHATBOT_RESPONSE = gql`
  query CommunityAIQuery($input: String!, $userId: ID!) {
    communityAIQuery(input: $input, userId: $userId) {
      retrievedPosts {
        title
        aiSummary
        category
        content
        id
      }
      suggestedQuestions
      text
    }
  }
`;

const CommunityChatbot = ({ userId }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatRef = useRef(null);
    const [geminiResponse, setGeminiResponse] = useState(null);
    const { error, refetch } = useQuery(GET_CHATBOT_RESPONSE, {
        variables: { userId, input },
        skip: true,
        onCompleted: (data) => {
            setGeminiResponse(data);
        },
    });

    const navigate = useNavigate()
    useEffect(() => {
        if (open && messages.length === 0) {
            setMessages([
                {
                    sender: "ai",
                    text: "Hello, My name is Alex. I help users to discuss discussions! How can I assist you today?",
                    retrievedPosts: [],
                    suggestedQuestions: [],
                },
            ]);
        }
    }, [open]);
    const [loading, setLoading] = useState(false)

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        setLoading(true);

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const { data } = await refetch({ userId, input });

            const aiResponse = {
                sender: "ai",
                text: data?.communityAIQuery?.text || "I'm not sure how to respond.",
                retrievedPosts: data?.communityAIQuery?.retrievedPosts || [],
                suggestedQuestions: data?.communityAIQuery?.suggestedQuestions || [],
            };

            setMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error fetching response:", error);
        } finally {
            setLoading(false); // Hide loading only after receiving response
        }
    };

    useEffect(() => {

        setTimeout(() => {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
            console.log(chatRef.current.scrollHeight)
        }, 50); // 50ms delay to ensure render is complete

    }, [open, messages]);


    const handleClick = (postId) => {
        navigate(`/discussion/${postId}`)
        setOpen(false)
    }
    return (
        <>
<Button
    variant="contained"
    color="primary"
    sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        borderRadius: "50%",
        width: "60px", // Fixed width
        height: "60px", // Fixed height
        padding: 0, // Remove any padding
    }}
    onClick={() => setOpen(true)}
>
    <ChatBubbleOutlineIcon sx={{ fontSize: 30 }} />  {/* Icon size adjustment */}
</Button>


            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={open}>
                    <Box
                        sx={{
                            position: "fixed",
                            bottom: 20,
                            right: 20,
                            width: "600px",
                            height: "700px",
                            bgcolor: "white",
                            borderRadius: "10px",
                            boxShadow: 24,
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            border: "1px solid #ccc",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Alex
                            </Typography>
                            <IconButton onClick={() => setOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Box ref={chatRef} sx={{ flex: 1, overflowY: "auto" }}>

                            {messages.map((msg, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                    {msg.sender === "user" && (
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                                            <Card sx={{ maxWidth: "75%", bgcolor: "#e3f2fd" }}>
                                                <CardContent>
                                                    <Typography variant="body1">{msg.text}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    )}

                                    {msg.sender === "ai" && (
                                        <Box>
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                                <Avatar sx={{ bgcolor: "#3f51b5", mr: 1 }}>AI</Avatar>
                                            </Box>

                                            <Card>
                                                <CardContent>
                                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                    {msg.retrievedPosts?.length > 0 && (
                                                        <Box sx={{ mt: 3 }}>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                Relevant Discussions:
                                                            </Typography>
                                                            <Box sx={{ display: "flex", gap: 2, overflowX: "auto", p: 1 }} >
                                                                {msg.retrievedPosts.map((post, i) => (
                                                                    <Card key={i} sx={{ minWidth: "220px", maxWidth: "220px", p: 1, boxShadow: 2, flexShrink: 0, bgcolor: "#f1f1f1" }} onClick={() => handleClick(post?.id)}>
                                                                        <Typography variant="h8">{post.title?.slice(0, 100) + "..."}</Typography>
                                                                        <Typography variant="body2" color="textSecondary">
                                                                            {post.content?.slice(0, 100) + "..."}
                                                                        </Typography>
                                                                    </Card>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}

                                                    {msg.suggestedQuestions?.length > 0 && (
                                                        <Box sx={{ mt: 3 }}>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                Suggested Questions:
                                                            </Typography>
                                                            {msg.suggestedQuestions.map((question, i) => (
                                                                <Typography
                                                                    key={i}
                                                                    variant="body2"
                                                                    sx={{ cursor: "pointer", color: "blue", mt: 1 }}
                                                                    onClick={() => setInput(question)}
                                                                >
                                                                    ➡ {question}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                        {loading && <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                            <CircularProgress />
                        </Box>}
                        <Divider />
                        <Box sx={{ display: "flex", p: 1, bgcolor: "#fff" }}>
                            <TextField fullWidth variant="outlined" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage() && !loading} />
                            <IconButton color="primary" onClick={handleSendMessage}>
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
};

export default CommunityChatbot;
