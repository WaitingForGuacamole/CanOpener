let path = require("path");

function getRootFolder(fromPath) {
    return fromPath.split(path.sep).slice(0, 1) + path.sep;
}

function getParentFolder(fromPath) {
    if (fromPath === getRootFolder(fromPath)) {
        return undefined;
    }

    return path.resolve(fromPath, "..");
}

function getGitRepo(fromPath) {
    let fs = require("fs");
    const hasDir = (p, n) =>
        fs.readdirSync(p).filter((f) => f === n && fs.statSync(path.join(p, f)).isDirectory()).length > 0;

    if (fromPath && hasDir(path.dirname(fromPath), ".git")) {
        return path.dirname(fromPath);
    } else if (fromPath) {
        return getGitRepo(getParentFolder(fromPath));
    } else {
        return undefined;
    }
}

let f = "C:\\git\\AmTrustAutomotive.BoundedContext.BusinessPartner\\build.cake";

var repo = getGitRepo(f);

console.log(repo);
