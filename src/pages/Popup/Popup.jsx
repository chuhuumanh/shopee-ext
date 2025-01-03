import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Divider,
  Avatar,
  Box,
  Button,
  TextField,
} from '@mui/material';
import axios from 'axios';
import './Popup.css';

const GOOGLE_API_KEY = 'AIzaSyA4MliCYL1Fq55V3CXQuNV5Fy9lyioJl6A';
const GOOGLE_SHEET_ID = '1Cmxdk7ta4q75rTtjU0DDNbO-k1vHrBo4r6vzt_B15qc';
const SHEET_RANGE = 'A1:A100';

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

const Popup = () => {
  const [apiKey, setApiKey] = useState('');
  const [isKeyActive, setIsKeyActive] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [cookies, setCookies] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey');
    if (storedKey) {
      checkKeyOnGoogleSheets(storedKey);
    }
  }, []);

  const checkKeyOnGoogleSheets = async (key) => {
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${SHEET_RANGE}?key=${GOOGLE_API_KEY}`
      );
      const validKeys = response.data.values.flat();

      if (validKeys.includes(key)) {
        setApiKey(key);
        setIsKeyActive(true);
      } else {
        alert('API Key không hợp lệ hoặc đã hết hạn!');
        setIsKeyActive(false);
        localStorage.removeItem('apiKey');
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra API Key:', error);
      alert('Không thể kiểm tra API Key. Vui lòng thử lại!');
    }
  };

  const handleActivateKey = () => {
    if (apiKey.trim()) {
      checkKeyOnGoogleSheets(apiKey);
      localStorage.setItem('apiKey', apiKey);
    } else {
      alert('Vui lòng nhập API Key!');
    }
  };

  const handleChange = (event) => {
    setTextValue(event.target.value);
  };

  const handleChangeCookies = (event) => {
    setCookies(event.target.value);
  };

  const handleSubmit = () => {
    const urls = textValue.split('\n');

    if (cookies) {
      chrome.runtime.sendMessage(
        {
          action: 'importCookies',
          data: cookies.trim(),
        },
        async () => {
          await wait(3000);
          if (urls.length > 0) {
            chrome.runtime.sendMessage({ action: 'start', urls: urls });
          }
        }
      );
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
              src="./icon-128.png"
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
      <Divider sx={{ mb: 2 }} />
      <CardContent>
        {!isKeyActive ? (
          <Box>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Vui lòng nhập API Key để kích hoạt
            </Typography>
            <TextField
              label="Nhập API Key"
              fullWidth
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleActivateKey}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Kích hoạt
            </Button>
          </Box>
        ) : (
          <Box>
            <TextField
              label="Nhập cookies"
              multiline
              rows={4}
              placeholder="Vui lòng nhập cookies"
              variant="outlined"
              style={{ width: '100%' }}
              value={cookies}
              onChange={handleChangeCookies}
            />
            <Divider sx={{ my: 2 }} />
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
          </Box>
        )}
      </CardContent>
      <Divider sx={{ mb: 2 }} />
    </Card>
  );
};

export default Popup;
