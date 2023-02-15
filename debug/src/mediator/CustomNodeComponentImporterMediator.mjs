import fs from "fs";
import esprima from "esprima";
import escodegen from "escodegen";
import { promisify } from "util";
import { exec } from "child_process";
import ImporterMediator from "./ImporterMediator.mjs";

const CUSTOM_COMPONENTS_PATH_PREFIX = "../..";

export default class CustomNodeComponentImporterMediator extends ImporterMediator {

  static async importCustomNodeComponent({ path }) {
    await CustomNodeComponentImporterMediator.installImportedPackages(path);
    CustomNodeComponentImporterMediator.defineGlobals();
    return this.importObject(`${CUSTOM_COMPONENTS_PATH_PREFIX}/${path}`);
  }

  static defineGlobals() {
    global.defineComponent = (x) => x;
  }

  static async installImportedPackages(path) {
    const pkgs = CustomNodeComponentImporterMediator.getImportedPackages(path);
    if (pkgs.length) {
      const command = `npx npm install ${pkgs.join(" ")}`;
      console.log("Installing packages...");
      await promisify(exec)(command);
    }
  }

  static getImportedPackages(path) {
    const filePath = `./debug/${path}`;
    const ast = CustomNodeComponentImporterMediator.getSourceAst(filePath);
    const pkgs = CustomNodeComponentImporterMediator.getImportedPackagesFromAst(ast);
    CustomNodeComponentImporterMediator.rewriteCodeWithPackageVersionImports(ast, filePath);
    return pkgs;
  }

  static getSourceAst(path) {
    const source = fs.readFileSync(path, "utf-8");
    return esprima.parseModule(source, {
      sourceType: "module",
    });
  }

  static getImportedPackagesFromAst(ast) {
    return [
      ...new Set(ast.body
        .filter(CustomNodeComponentImporterMediator.isImportDeclaration)
        .map((node) => node.source.value)),
    ];
  }
  static rewriteCodeWithPackageVersionImports(ast, path) {
    CustomNodeComponentImporterMediator.removePackageVersion(ast);
    const output = escodegen.generate(ast);
    fs.writeFileSync(path, output);
  }

  static removePackageVersion(ast) {
    ast.body
      .filter(CustomNodeComponentImporterMediator.isImportDeclaration)
      .forEach((node) => node.source.value = node.source.value.replace(/@\d+.\d*.\d*/g, ""));
  }

  static isImportDeclaration(node) {
    return node.type === "ImportDeclaration";
  }

}
