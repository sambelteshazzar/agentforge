import { describe, it, expect } from "vitest";
import { prepareCodeForLive } from "./prepareCodeForLive";

describe("prepareCodeForLive", () => {
  describe("TypeScript syntax stripping in JSX components", () => {
    it("removes type annotations from function component parameters", () => {
      const input = `function Greet({ name }: { name: string }) { return <div>{name}</div>; }`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain(": string");
      expect(result).toContain("<div>");
    });

    it("removes type annotations from arrow function component", () => {
      const input = `const Greet = ({ name }: Props) => { return (<div>{name}</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain(": Props");
      expect(result).toContain("<div>");
    });

    it("removes return type annotations", () => {
      const input = `function Greet(): JSX.Element { return <div>Hello</div>; }`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("JSX.Element");
    });

    it("removes 'as' type assertions", () => {
      const input = `const MyComponent = () => { return (<div>{value as string}</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("as string");
    });

    it("removes 'satisfies' expressions", () => {
      const input = `const MyComponent = () => { const config = { a: 1 } satisfies Config; return (<div>{config.a}</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("satisfies");
    });

    it("removes React.FC type annotations", () => {
      const input = `const MyComponent: React.FC<Props> = () => { return (<div>Hi</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("React.FC");
    });

    it("removes generic type parameters from functions", () => {
      const input = `function Container<T>() { return (<div>Container</div>); }`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("<T>");
      expect(result).toContain("<div>");
    });
  });

  describe("Module syntax stripping", () => {
    it("removes import statements", () => {
      const input = `import React from 'react';\nconst MyComponent = () => <div>Hello</div>;`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("import");
      expect(result).toContain("<div>Hello</div>");
    });

    it("removes named exports", () => {
      const input = `export { foo, bar };`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("export");
    });

    it("removes export default identifier statements", () => {
      const input = `const MyComponent = () => { return (<div />); };\nexport default MyComponent;`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("export default MyComponent");
    });

    it("removes export keyword from declarations", () => {
      const input = `export const MyComponent = () => { return (<div>Hello</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("export");
      expect(result).toContain("<div>Hello</div>");
    });
  });

  describe("Type/interface declarations", () => {
    it("removes interface declarations", () => {
      const input = `interface User { name: string; }\nconst MyComponent = () => { return (<div>User</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("interface");
      expect(result).toContain("<div>User</div>");
    });

    it("removes type declarations", () => {
      const input = `type Status = 'active' | 'inactive';\nconst MyComponent = () => { return (<div>Status</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).not.toContain("type Status");
      expect(result).toContain("<div>Status</div>");
    });
  });

  describe("JSX extraction", () => {
    it("extracts JSX from function component", () => {
      const input = `const MyComponent = () => { return (<div>Hello</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).toContain("<div>Hello</div>");
    });

    it("extracts JSX from arrow function returning directly", () => {
      const input = `const MyComponent = () => <div>Hello</div>;`;
      const result = prepareCodeForLive(input);
      expect(result).toContain("<div>Hello</div>");
    });

    it("handles plain JSX input", () => {
      const input = `<div className="container"><h1>Title</h1></div>`;
      const result = prepareCodeForLive(input);
      expect(result).toBe(input);
    });
  });

  describe("Fallback behavior", () => {
    it("renders plain JS as formatted text block", () => {
      const input = `const sum = (a, b) => a + b;`;
      const result = prepareCodeForLive(input);
      expect(result).toContain("JavaScript Output:");
      expect(result).toContain("<pre");
    });

    it("wraps non-JSX code safely", () => {
      const input = `const msg = "Hello <world>";`;
      const result = prepareCodeForLive(input);
      // Should be safely escaped inside JSON.stringify
      expect(result).toContain("<pre");
    });
    
    it("renders empty string as empty output block", () => {
      const result = prepareCodeForLive("");
      // Empty input still produces a fallback block
      expect(result).toContain("<pre");
    });
  });

  describe("Edge cases", () => {
    it("handles template literals without corruption", () => {
      const input = "const MyComponent = () => { const msg = `Hello`; return (<div>{msg}</div>); };";
      const result = prepareCodeForLive(input);
      expect(result).toContain("<div>");
    });

    it("handles object destructuring with colons", () => {
      const input = `const MyComponent = () => { const { a: renamed } = obj; return (<div>{renamed}</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).toContain("<div>");
    });

    it("handles ternary operators in JSX", () => {
      const input = `const MyComponent = () => { return (<div>{condition ? "yes" : "no"}</div>); };`;
      const result = prepareCodeForLive(input);
      expect(result).toContain("<div>");
    });

    it("handles multiline component definitions", () => {
      const input = `
const Card = () => {
  return (
    <div className="card">
      <h1>Title</h1>
      <p>Content</p>
    </div>
  );
};`;
      const result = prepareCodeForLive(input);
      expect(result).toContain('<div className="card">');
    });
  });
});

