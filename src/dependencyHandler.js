const axios = require('axios');
const NodeCache = require("node-cache");

const cache = new NodeCache();

async function getDependency(name, packageName, version) {
    let dependencies;
    version = normalizeVersion(version);

    const cachedDep = cache.get(name);
    if (!cachedDep) {
        dependencies = await getDepFromNpm(packageName, version);
        cache.set(name, dependencies);
        return getDependencyNode(dependencies, name);
    } else {
        return getDependencyNode(cachedDep, name);
    }
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

function normalizeVersion(version) {
    if (version.includes('~')) {
        version = version.split('~').join('');
    }
    if (version.includes('^')) {
        version = version.split('^').join('');
    }
    return version;
}

async function getDepFromNpm(packageName, version) {
    const url = `https://registry.npmjs.org/${packageName}/${version}`;
    const response = await axios.get(url);
    //TODO: do we need to include devDependency?
    return response.data.dependencies;
}

function getDepTree(arr) {
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

module.exports ={getDependency, getDepTree};