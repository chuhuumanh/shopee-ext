import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Divider,
  Avatar,
  Box,
  Button,
} from '@mui/material';
import TextField from '@mui/material/TextField';

import './Popup.css';

const Popup = () => {
  const [textValue, setTextValue] = useState(
    'https://shopee.vn/%C3%81o-Len-C%E1%BB%95-L%E1%BB%8D-Ch%E1%BA%A5t-D%C3%A0y-D%E1%BA%B7n-Cho-B%C3%A9-i.1158091736.24708496773?publish_id=&sp_atk=3e6c388e-b7f3-4b51-a8f0-573acdc110ec&xptdk=3e6c388e-b7f3-4b51-a8f0-573acdc110ec'
  );

  const handleChange = (event) => {
    setTextValue(event.target.value);
  };

  const handleSubmit = () => {
    const urls = textValue.split('\n');
    if (urls.length > 0) {
      chrome.runtime.sendMessage({ action: 'start', urls: urls });
    }
  };
  return (
    <Card sx={{ width: 800 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              alt="Company Logo"
              src="./icon128.png"
              sx={{ width: 40, height: 40, marginRight: 1 }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: '#4b6cfd', marginRight: 1 }}
            >
              Crawl
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: '#4b6cfd', fontWeight: 'bold' }}
            >
              Shopee
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <Divider sx={{ mb: 2 }} /> {/* Border phân cách dưới Header */}
      <CardContent>
        <TextField
          label="Nhập link mỗi dòng"
          multiline
          rows={4}
          placeholder="Nhập các link, mỗi link một dòng..."
          variant="outlined"
          style={{ width: '100%' }}
          value={textValue}
          onChange={handleChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          style={{ marginTop: 16 }}
        >
          Bắt đầu
        </Button>
      </CardContent>
      <Divider sx={{ mb: 2 }} /> {/* Border phân cách dưới Header */}
    </Card>
  );
};

export default Popup;
