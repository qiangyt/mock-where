const SRC = '../src';
const Beans = require(`${SRC}/Beans`);
const Config = require(`${SRC}/Config`);

const mockRequire = require('mock-require');

// SpiedBean1 mocks a regular bean module
class SpiedBean1 {

    constructor() {
        this.inited = 0;
    }

    init() {
        this.inited++;
    }
}

mockRequire('Bean1', SpiedBean1);


// SpiedBean2 mocks a bean module which create another bean dynamicaly during init()
class SpiedBean2 {

    constructor() {
        this.inited = 0;
    }

    init() {
        this.bean3 = Beans.create('Bean3');
        this.inited++;
    }
}

mockRequire('Bean2', SpiedBean2);


// SpiedBean3 mocks the bean module who has no init()
class SpiedBean3 {

    constructor() {
        this.inited = 0;
    }

}

mockRequire('Bean3', SpiedBean3);

describe("Beans test suite: ", function() {

    it("create(): happy", function() {
        const cfg = Config.bean1 = {};
        const bean = Beans.create('Bean1', 'bean1');

        expect(bean instanceof SpiedBean1).toBeTruthy();
        expect(bean._name).toBe('bean1');
        expect(bean._logger).toBeDefined();
        expect(bean._module).toEqual(SpiedBean1);
        expect(bean._config).toEqual(cfg);
        expect(Beans.all.bean1).toEqual(bean);
        expect(Beans.get('bean1')).toEqual(bean);
    });

    it("create(): auto-assign name", function() {
        const bean = Beans.create('Bean2');

        expect(bean instanceof SpiedBean2).toBeTruthy();
        expect(bean._name).toBe('bean2');
        expect(Beans.get('bean2')).toEqual(bean);
    });

    it("create(): duplicated", function() {
        try {
            Beans.create('Bean1');
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it("load(): not found", function() {
        try {
            Beans.load('beanX');
            fail('exception is expected to raise');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it("load(): found", function() {
        const bean = Beans.load('bean1');
        expect(bean._name).toBe('bean1');
    });

    it("get(): not found", function() {
        const bean = Beans.get('beanx');
        expect(bean).toBeUndefined();
    });

    it("get(): found", function() {
        const bean = Beans.get('bean1');
        expect(bean._name).toBe('bean1');
    });

    it("init(): happy", function() {
        Beans.init();

        const bean1 = Beans.get('bean1');
        expect(bean1.inited).toBe(1);

        const bean2 = Beans.get('bean2');
        expect(bean2.inited).toBe(1);

        const bean3 = Beans.get('bean3');
        expect(bean3.inited).toBe(0);
    });

});