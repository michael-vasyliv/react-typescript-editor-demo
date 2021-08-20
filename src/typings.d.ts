declare module '*.svg' {
    import * as React from 'react';

    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

    export default ReactComponent;
}

type ExtendProps<T extends (...args: any) => any> = T extends (first: infer P) => any ? P : never;

type Nullable<T> = T | undefined;
