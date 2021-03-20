'use strict';

const express = require('express');
const axios = require('axios');
const NodeCache = require("node-cache");

let app = express();
app.use(express.json());
const cache = new NodeCache();
let indent = 1;

function getTree(arr) {
    const root = [];
    const map = {};

    arr.forEach(node => {
        if (!node.parentId) {
            return root.push(node);
        }

        let parentIndex = map[node.parentId];
        if (!parentIndex) {
            parentIndex = arr.findIndex(el => el.id === node.parentId);
            map[node.parentId] = parentIndex;
        }

        if (!arr[parentIndex].children) {
            return arr[parentIndex].children = [node];
        }
        arr[parentIndex].children.push(node);
    });

    return root;
}

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

async function getDepFromNpm(packageName, version) {
    const url = `https://registry.npmjs.org/${packageName}/${version}`;
    const response = await axios.get(url);
    //TODO: do we need to include devDependency?
    return response.data.dependencies;
}

function normalizeVersion(version) {
    if (version.includes('~')) {
        version = version.split('~').join('');
    }
    if (version.includes('^')) {
        version = version.split('^').join('');
    }
    return version;
}

function getDependencyNode(deps, name) {
    let arr = [];
    for (let dep in deps) {
        const depName = `${dep}:${deps[dep]}`;
        const item = {id: depName, parentId: name};
        arr.push(item);
    }
    return arr;
}

async function getDependency(name, packageName, version) {
    let dependencies;
    version = normalizeVersion(version);

    const cachedDep = cache.get(name);
    if (!cachedDep) {
        dependencies = await getDepFromNpm(packageName, version);

        cache.set(name, dependencies);
        return getDependencyNode(dependencies, name);
    } else {
        console.log("Getting dependencies from cache");
        return getDependencyNode(cachedDep, name);
    }
}

async function handler() {
    console.log("App is running...");

    app.get('/package/:packageName/:version', async function (req, res) {
        indent = 1;
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

            let tree = getTree(arr);
            printTree(tree);

            res.status(200).json({tree});
        } catch (error) {
            console.log(`Error occurred: ${error}`);
            res.send('error');
        }
    });

    app.listen(8000);
}

handler();
