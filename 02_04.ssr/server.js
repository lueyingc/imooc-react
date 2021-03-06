import {
  createServer
} from "http"
import React from "react"
import ReactDOMServer from "react-dom/server"
import {
  StaticRouter
} from "react-router"
import App from "./src/App"
import buildPath from './build/asset-manifest.json'
import fs from 'fs'
import url from 'url'
import path from 'path'
import {
  getType as getMimeType
} from "mime"

createServer((req, res) => {
  if (req.url.startsWith('/static/')) {
    let pathname = "./build" + url.parse(req.url).pathname
    fs.exists(pathname, function (exists) {
      if (!exists) {
        res.writeHead("404", {
          "content-type": "text/plain"
        })
        res.write("404,not found!")
        res.end()
      } else {
        fs.readFile(pathname, function (err, data) {
          if (err) {
            res.writeHead(500, {
              "content-type": "text/plain"
            })
            res.end(err)
          } else {
            let ext = path.extname(pathname)
            let contenttype = getMimeType(ext) || "text/plain"
            res.writeHead(200, {
              "content-type": contenttype
            })
            res.write(data)
            res.end()
          }
        })
      }
    })
    return
  }
  const context = {}

  const frontComponents = ReactDOMServer.renderToString(
    <StaticRouter location={req.url} context={context} >
      <App />
    </StaticRouter>
  )
  var index = fs.readFileSync('./build/index.html')
  if (context.url) {
    res.writeHead(301, {
      Location: context.url
    })
    res.end()
  } else {
    const frontHtml = index.toString().replace('<div id="root"></div>', `<div id="root">${frontComponents}</div>`)
    res.write(frontHtml)
    res.end()
  }
}).listen(3000)