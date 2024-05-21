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

function CookiesToJson(e) {
  var o = e.match(/(Mozilla.*?)\|/);
  // eslint-disable-next-line no-unused-expressions
  o &&
    (chrome.storage.local.set({ anh_user_agent: o[1] }),
    chrome.storage.local.set({ default_user_agent: 0 }),
    chrome.runtime.sendMessage({ greeting: o[1] }));
  var t = e.match('(\\.|)shopee(.*?)$'),
    i = '';
  if (!t) return '';
  for (var n = t[0].split(';'), a = 0; a < n.length; a++)
    if (n[a]) {
      var s = n[a].split('='),
        c = s[0],
        r = s[1];
      i +=
        '{"domain":"' +
        c +
        '","name":"' +
        r +
        '","path":"/","value":"' +
        n[a].match(c + '=' + r + '=(.*?)$')[1].replaceAll('"', '') +
        '"},';
    }
  return (i = '[' + (i = i.substring(0, i.length - 1)) + ']');
}

const Popup = () => {
  const [textValue, setTextValue] = useState('');
  const [cookies, setCookies] = useState('');

  const handleChange = (event) => {
    setTextValue(event.target.value);
  };

  const handleChangeCookies = (event) => {
    setCookies(event.target.value);
  };

  const handleSubmit = () => {
    const urls = textValue.split('\n');

    if (cookies) {
      const cookiesJSON = CookiesToJson(cookies.trim());
      chrome.runtime.sendMessage(
        {
          action: 'importCookies',
          data: cookiesJSON,
        },
        () => {
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
      <Divider sx={{ mb: 2 }} /> {/* Border phân cách dưới Header */}
      <CardContent>
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
