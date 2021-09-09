# node-js-crawler

This crawler will list top domains and sources of an article in medium.com. This can be customised for any website by changing few variables.

TO START THIS CRAWLER:

1) npm init -y
2) npm install
3) node index.js

You will see results in results folder.

TO EDIT THE CRAWLER:
- If you don't want browser to open while crawling set headless in puppeteer.launch as true.
- To change domain edit the global variable url and href.includes() in extractItems().
- Change the number of articles/itms you want to crawl by changing value of itemsCount
- To change selector or crawl other items you can change querySelectorAll() in extractItems()


THANKS FOR USING THIS!!!!
