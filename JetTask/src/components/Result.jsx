import Graphic from './Graphic'
import {
  euro,
} from '../data/const'

function Result({net, gross, month, region, breakdown}) {
return (
        <div className="flex flex-col gap-5" >
            <section
              aria-live="polite"
              className="flex flex-col gap-1.5 rounded-xl border border-accent-line bg-accent-soft p-6 text-center"
            >
              <p className="text-[15px] text-body">Monthly net salary</p>
              <p className="text-4xl font-medium tracking-tight text-heading sm:text-5xl">
                {euro.format(net)}
              </p>
              <p className="text-[15px] text-body">
                {euro.format(gross)} over {month} monthly payments ·{' '}
                {region}
              </p>
            </section>

            <Graphic breakdown={breakdown} />
        </div>
        )
}


export default Result