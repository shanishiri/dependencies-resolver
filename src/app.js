'use strict';

const {getDependency, getDepTree} = require("./dependencyHandler");
const express = require('express');

let app = express();
app.use(express.json());

let indent = 1;

function printNodesInTree(tree) {
    tree.forEach(function (node) {
        console.log(' --' + Array(indent).join('--'), node.id);
        if (node.children) {
            indent++;
            printTree(node.children);
        }
        if (tree.indexOf(node) === tree.length - 1) {
            indent--;
        }
    });
}

function printTree(tree) {
    if (tree[0].children) {
        console.log(tree[0].id);
        tree = tree[0].children;
    }
    printNodesInTree(tree);
}

async function handler() {
    app.get('/package/:packageName/:version', async function (req, res) {
        indent = 1;
        //TODO: add input validation
        const {packageName, version} = req.params;
        const name = `${packageName}:${version}`;
        let arr = [];

        try {
            arr.push({id: name, parentId: null});
            let resArr = await getDependency(name, packageName, version);
            arr = [...arr, ...resArr];

            for (let obj of arr) {
                if (obj.parentId !== null) {
                    let splitedId = obj.id.split(":");
                    let newArr = await getDependency(obj.id, splitedId[0], splitedId[1]);
                    arr = [...arr, ...newArr];
                }
            }

            let tree = getDepTree(arr);
            printTree(tree);

            res.status(200).json({tree});
        } catch (error) {
            console.log(`Error occurred: ${error}`);
            res.send('error');
        }
    });
}

handler();

module.exports ={handler};
module.exports = app;