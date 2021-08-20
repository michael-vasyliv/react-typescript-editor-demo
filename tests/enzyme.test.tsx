import { mount, render, shallow } from 'enzyme';
import React, { useEffect, useState } from 'react';

function Test() {
    const [state, setState] = useState('');

    useEffect(() => {
        setState('Working');
    }, []);

    return (
        <>
            {state}
        </>
    );
}

describe('Test', () => {
    it('1+1', () => {
        expect(1 + 1).toEqual(2);
    });
    it('check Test with shallow', () => {
        /**
         * it's well known issue https://github.com/enzymejs/enzyme/issues/2086
         * see roadmap https://github.com/enzymejs/enzyme/projects/4#card-20211476
         */
        const component = shallow(<Test />);
        expect(component).toBeDefined();
        expect(component.text()).toEqual('');
    });
    it('check Test with mount', () => {
        const component = mount(<Test />);
        expect(component).toBeDefined();
        expect(component.text()).toEqual('Working');
    });
    it('check Test with render', () => {
        const component = render(<Test />);
        expect(component).toBeDefined();
        expect(component.text()).toEqual('');
    });
});
