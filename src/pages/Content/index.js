const selectors = {};

function waitForElement(selector, callback) {
  const observer = new MutationObserver((mutations, obs) => {
    if (document.querySelector(selector)) {
      callback();
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

async function executeLogic() {
  const getNextButton = () => {
    let nextButton = null;
    const listButtonNextPage = document.querySelectorAll(
      `.product-ratings__page-controller button`
    );

    listButtonNextPage.forEach((button, index) => {
      if (button.classList.contains('shopee-button-solid')) {
        if (
          listButtonNextPage[index + 1] &&
          isNumber(+listButtonNextPage[index + 1].textContent)
        ) {
          nextButton = listButtonNextPage[index + 1];
          return;
        }
      }
    });
    return nextButton;
  };
  const LIMIT_PAGE = 5;
  let isStop = false;
  do {
    const dataExport = [];
    const reviews = document.querySelectorAll(`.shopee-product-rating`);
    reviews.forEach((element) => {
      let comment = '';
      const elementComment = element.querySelectorAll(
        `[style="position: relative; box-sizing: border-box; margin: 15px 0px; font-size: 14px; line-height: 20px; color: rgba(0, 0, 0, 0.87); word-break: break-word; white-space: pre-wrap;"] div`
      );

      elementComment.forEach((element) => {
        const isHaveSpan = element.querySelector('span');
        if (!isHaveSpan && element.textContent !== null) {
          comment += element.textContent;
        }
      });

      const links = [];
      const elementLinks = element.querySelectorAll(
        `.rating-media-list .rating-media-list__zoomed-image ul >li`
      );
      elementLinks.forEach((elementLink) => {
        const isVideo = elementLink.querySelector('video');
        if (isVideo) {
          links.push({
            link: elementLink.querySelector('video').src,
            type: 'video',
          });
        } else {
          links.push({
            link: elementLink.querySelector('img').src,
            type: 'img',
          });
        }
      });

      if (comment || links.length > 0) {
        dataExport.push({
          comment,
          links,
        });
      }
    });
    console.log(dataExport);

    const buttonNext = getNextButton();
    if (!buttonNext || buttonNext.textContent > LIMIT_PAGE) {
      isStop = true;
      return;
    }

    buttonNext.click();
    await wait(1500);
  } while (!isStop);
  console.log('thoát khỏi con mập');

  // chrome.runtime.sendMessage({ action: 'next' });
}
function getElementPosition(selector) {
  const element = document.querySelector(selector);
  if (element) {
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
  }
  return -1; // Trả về -1 nếu không tìm thấy phần tử
}

// Wait for the element with class "product-ratings__header_score"
waitForElement('.product-ratings__header_score', async () => {
  const elementPosition = getElementPosition('.product-ratings__header_score');
  if (elementPosition !== -1) {
    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
  }
  await executeLogic();
});
