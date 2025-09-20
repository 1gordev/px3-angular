import { MomentToTimePipe } from './moment-pipe.ts.pipe';

describe('MomentPipeTsPipe', () => {
  it('create an instance', () => {
    const pipe = new MomentToTimePipe();
    expect(pipe).toBeTruthy();
  });
});
