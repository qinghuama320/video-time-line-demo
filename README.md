# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

基于 [react-beautifull-dnd](https://github.com/atlassian/react-beautiful-dnd)开发。\
优势是，动画效果好、自适应；缺点是封装太深，很多底层信息、比如坐标信息拿不到了，代码中用了很多事件监听来做。\
更好的选择是[react-dnd](https://github.com/react-dnd)，不过因为时间太短，无法推倒重来了。\
\
也因为 react-beautifull-dnd 有自适应，拖动元素一到元素二的位置时，元素二自动往后；放下元素后又因为定位重新回来，体验效果没有视频的好。\
还是这个原因，所以 clip 替换功能没有实现，做了一个右上角的删除按钮。\
\
此外，不知道 clip 重叠时是否需要做拼接，视频中没有体现，所以没有实现。\
\
\
周末差不多搞了两天，一天要弄完还有有点难度的，除非对 react-dnd 非常熟悉。大部分时间都在填 react-beautifull-dnd 的坑。
