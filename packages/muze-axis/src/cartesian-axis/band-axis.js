import SimpleAxis from './simple-axis';
import { BAND } from '../enums/scale-type';
import { TOP, BOTTOM } from '../enums/axis-orientation';
import { calculateBandSpace, setOffset, getRotatedSpaces } from './helper';
import { spaceSetter } from './space-setter';

export default class BandAxis extends SimpleAxis {

    /**
     *
     *
     * @param {*} config axes configuration
     *
     * @memberof BandAxis
     */
    createScale (config) {
        return super.createScale(config);
    }

    /**
     *
     *
     * @static
     *
     * @memberof BandAxis
     */
    static type () {
        return BAND;
    }

     /**
     * This method is used to set the space availiable to render
     * the SimpleCell.
     *
     * @param {number} width The width of SimpleCell.
     * @param {number} height The height of SimpleCell.
     * @memberof AxisCell
     */
    setAvailableSpace (width = 0, height, padding, isOffset) {
        let labelConfig = {};
        const {
           orientation
       } = this.config();

        this.availableSpace({ width, height, padding });

        if (orientation === TOP || orientation === BOTTOM) {
            labelConfig = spaceSetter(this, { isOffset }).band.x();
        } else {
            labelConfig = spaceSetter(this, { isOffset }).band.y();
        }

        // Set config
        this.renderConfig({
            labels: labelConfig
        });
        this.setTickConfig();
        return this;
    }

    /**
     *
     *
     *
     * @memberof BandAxis
     */
    setTickConfig () {
        let smartTicks = '';
        let smartlabel;
        const domain = this.domain();
        const { labelManager } = this._dependencies;
        const { tickValues, padding } = this.config();
        const { labels } = this.renderConfig();
        const { height: availHeight, width: availWidth, noWrap } = this.maxTickSpaces();
        const { width, height } = getRotatedSpaces(labels.rotation, availWidth, availHeight);

        tickValues && this.axis().tickValues(tickValues);
        smartTicks = tickValues || domain;

        // set the style on the shared label manager instance
        labelManager.setStyle(this._tickLabelStyle);

        // Update padding between plots
        if (typeof padding === 'number' && padding >= 0 && padding <= 1) {
            this.scale().padding(padding);
        }

        if (domain && domain.length) {
            const values = tickValues || domain;
            const tickFormatter = this._tickFormatter(values);
            smartTicks = values.map((d, i) => {
                labelManager.useEllipsesOnOverflow(true);

                smartlabel = labelManager.getSmartText(tickFormatter(d, i), width, height, noWrap);
                return labelManager.constructor.textToLines(smartlabel);
            });
        }
        this.smartTicks(smartTicks);
        return this;
    }

    /**
     * Gets the space occupied by the axis
     *
     * @return {Object} object with details about size of the axis.
     * @memberof SimpleAxis
     */
    getLogicalSpace () {
        if (!this.logicalSpace()) {
            this.logicalSpace(calculateBandSpace(this));
            setOffset(this);
            this.logicalSpace();
        }
        return this.logicalSpace();
    }

    /**
     *
     *
     * @memberof BandAxis
     */
    getTickValues () {
        return this.axis().scale().domain();
    }

    sanitizeTickFormatter (value) {
        const { tickFormat } = value;

        if (tickFormat) {
            return ticks => (val, i) => tickFormat(val, val, i, ticks);
        }
        return () => val => this.valueParser()(val);
    }

    /**
     *
     *
     *
     * @memberof BandAxis
     */
    getUnitWidth () {
        return this.scale().bandwidth();
    }

    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    getTickSize () {
        const {
            showInnerTicks,
            showOuterTicks
        } = this.renderConfig();
        const axis = this.axis();

        axis.tickSizeInner(showInnerTicks ? 6 : 0);
        axis.tickSizeOuter(showOuterTicks ? 6 : 0);
        return axis.tickSize();
    }

    invertExtent (v1, v2) {
        return this.scale().invertExtent(v1, v2);
    }

    /**
     * Gets the nearest range value from the given range values.
     * @param {number} v1 Start range value
     * @param {number} v2 End range value
     * @return {Array} range values
     */
    getNearestRange (v1, v2) {
        const scale = this.scale();
        const range = scale.range();
        const reverse = range[0] > range[1];

        const extent = this.invertExtent(v1, v2);
        const p1 = scale(reverse ? extent[extent.length - 1] : extent[0]);
        const p2 = scale(reverse ? extent[0] : extent[extent.length - 1]) + scale.bandwidth();
        return [p1, p2];
    }
}
