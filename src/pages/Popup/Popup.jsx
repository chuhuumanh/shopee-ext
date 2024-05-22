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
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

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
  const [textValue, setTextValue] = useState('432432');
  const [cookies, setCookies] = useState(
    'podn0h41zo|NovaPro@1|.shopee.vn=SPC_SI=Frg4ZgAAAABpNm9aTWtuRGzv3QEAAAAAVlBETXJjV2U=;shopee.vn=SPC_SEC_SI=v1-N0p6a1NLc2x2VkxGcGtid7ulA9dXRixiX+DC1C9jXuTBm+2bw/LIa+TkUI8oChz1eLcAPstEyguo6nic5F+dtxu+vLQ4DGxiYCB7ljiZkv4=;.shopee.vn=SPC_F=Lb5cp4PQOWCr8IpEAkx15E2uJNZ2GhUc;.shopee.vn=REC_T_ID=2e4c1d94-178b-11ef-9f3b-8e5e3f882131;.shopee.vn=_hjSession_868286=eyJpZCI6ImI4OGVjN2FmLTI1NjMtNDU2Ny1hNDRkLWM3NWRjMmYyZWQxNyIsImMiOjE3MTYzMDUyMTc4MDksInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjoxLCJzcCI6MH0=;.shopee.vn=_hjSessionUser_868286=eyJpZCI6IjNmYmY1MjYzLTM1ZjYtNTg3Ny1hZDI5LWFiY2MyZDE4YTBjYSIsImNyZWF0ZWQiOjE3MTYzMDUyMTc4MDYsImV4aXN0aW5nIjp0cnVlfQ==;.shopee.vn=__LOCALE__null=VN;.shopee.vn=_gcl_au=1.1.111446607.1711611480;.shopee.vn=_fbp=fb.1.1711611480596.882071739;.shopee.vn=csrftoken=bCQVMyBTioGAmfL3XyWp6ECf3JQ36nqR;shopee.vn=__LOCALE__null=VN;.shopee.vn=_QPWSDCXHZQA=e2ddabf1-ada3-46b5-a838-8c6601f8bd55;shopee.vn=REC7iLP4Q=a129e31e-433f-4530-8391-510e95fb035e;.shopee.vn=AMP_TOKEN=%24NOT_FOUND;.shopee.vn=_gid=GA1.2.35675758.1711611484;.shopee.vn=SPC_CLIENTID=UWNqbG5OZkNScUl3ycaccgfrhehmgqyp;.shopee.vn=SPC_P_V=IpaxakbzqJSeHkgoLBNggosb4W+GARigBZxwe46YplWkRYjkqoY4zvTGbjhq2FrleZnNL+XhgnV5tLpgX6TEmzVOaEYo1cBgePrSTshFkF6EIJSELdRE1/Pn9EY+C5Bdk1xlfI/3FCJKAvNH4ElOtun+ITHU05tORmgk0gVzyzY=;.shopee.vn=_dc_gtm_UA-61914164-6=1;shopee.vn=_sapid=d85f8fda6f7321bf63bb4c61c905a80f867dc2e75fa7115fc4947c9f;.shopee.vn=REC7iLP4Q=a129e31e-433f-4530-8391-510e95fb035e;.shopee.vn=_sapid=d85f8fda6f7321bf63bb4c61c905a80f867dc2e75fa7115fc4947c9f;.shopee.vn=SPC_EC=.N0dyaHRMWTU2WlI3cVJCMb69JALNwjN02sqpRN5MOjGrvowWBFDl86NdL89Q1gVeMb1s3JgXvsR+aG+i3GpllZKcGR6nCJt668KDEvjtq/TCHQ8Id1e7/ERDL7aEQAibmFlnIjnEgyxL3NAnLOWAXyWHC52wbiURljqPS9dK0vsxF6gjoo1q7dfhE+c//mL7tAxyOSx7q1LX1S9JFoLVLnJNY0Vo/eE0b/G89HOlRzI=;.shopee.vn=SPC_ST=.N0dyaHRMWTU2WlI3cVJCMb69JALNwjN02sqpRN5MOjGrvowWBFDl86NdL89Q1gVeMb1s3JgXvsR+aG+i3GpllZKcGR6nCJt668KDEvjtq/TCHQ8Id1e7/ERDL7aEQAibmFlnIjnEgyxL3NAnLOWAXyWHC52wbiURljqPS9dK0vsxF6gjoo1q7dfhE+c//mL7tAxyOSx7q1LX1S9JFoLVLnJNY0Vo/eE0b/G89HOlRzI=;.shopee.vn=SPC_U=1050983724;.shopee.vn=shopee_webUnique_ccd=INfYUCltms1IIFVDjYQtrg%3D%3D%7CMKyuUCLs%2BjETHVxN6oxORhJAZQC2%2B%2FN4EjnURPVjcTSjnY1Jy7gCcY2NgXM6AZrIUo0F08sJu3Q%3D%7CJd8Xvb%2BejBM9rQR7%7C08%7C3;.shopee.vn=ds=4cf432df041641a6ce8225f1643d45d9;.shopee.vn=SPC_IA=1;.shopee.vn=SPC_T_ID=1Fl96UfNlvZPPgH6g/bO3CEp3Gw2Gu0bWLMpQ4vnn9xPVSc1IIciQbvkLC9khC7VLapY1/kLfzgPeUZhHQKeSmZbkt2P03lQ7O1lC5GGYtVhdEiu5n9j0fLCluN53R+7St/EsCwyMyIm6TrAOGFuRJcTVYBLEVhEcnCx8YISkqE=;.shopee.vn=SPC_T_IV=bVVYVHNkeHNVWW9JVTMxYQ==;.shopee.vn=SPC_R_T_ID=1Fl96UfNlvZPPgH6g/bO3CEp3Gw2Gu0bWLMpQ4vnn9xPVSc1IIciQbvkLC9khC7VLapY1/kLfzgPeUZhHQKeSmZbkt2P03lQ7O1lC5GGYtVhdEiu5n9j0fLCluN53R+7St/EsCwyMyIm6TrAOGFuRJcTVYBLEVhEcnCx8YISkqE=;.shopee.vn=SPC_R_T_IV=bVVYVHNkeHNVWW9JVTMxYQ==;.shopee.vn=SPC_CDS_CHAT=44709297-f368-42ca-871f-505c31484ddf;shopee.vn=shopee_webUnique_ccd=Vxq2D1IeQEj4pdHfHJEdPA%3D%3D%7CP6yuUCLs%2BjETHVxN6oxORhJAZQC2%2B%2FN4EjnURFq2TTSjnY1Jy7gCcY2NgXM6AZrIUo0F08sJu3Q%3D%7CJd8Xvb%2BejBM9rQR7%7C08%7C3;shopee.vn=ds=169a200245a8eda5fac9e6818b121815;.shopee.vn=_ga_4GPP1ZXG63=GS1.1.1716306966.2.1.1716307245.60.0.0;.shopee.vn=_ga=GA1.1.631040511.1711611483;'
  );

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
          action: 'INIT',
          cookies: cookies,
          urls,
        }
        // async () => {
        //   await wait(3000);
        //   if (urls.length > 0) {
        //     chrome.runtime.sendMessage({ action: 'start', urls: urls });
        //   }
        // }
      );

      // const cookiesJSON = CookiesToJson(cookies.trim());
      // chrome.runtime.sendMessage(
      //   {
      //     action: 'importCookies',
      //     data: cookiesJSON,
      //   },
      //   async () => {
      //     await wait(3000);
      //     if (urls.length > 0) {
      //       chrome.runtime.sendMessage({ action: 'start', urls: urls });
      //     }
      //   }
      // );
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
