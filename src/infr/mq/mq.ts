import * as Queue from 'bull';
import config from '../../config';

function mqMain (): void {
  let videoQueue = new Queue('video transcoding', config.REDIS_URL);
  let imageQueue = new Queue('image_transcoding', config.REDIS_URL);
  let pdfQueue = new Queue('pdf transcoding', config.REDIS_URL);

  videoQueue.process(function (job: any, done: any): void {

    // job.data contains the custom data passed when the job was created
    // job.id contains id of this job.

    // transcode video asynchronously and report progress
    job.progress(42);

    // call done when finished
    done();

    // or give a error if error
    done(new Error('error transcoding'));

    // or pass it a result
    done(null, { framerate: 29.5 /* etc... */ });

    // If the job throws an unhandled exception it is also handled correctly
    throw new Error('some unexpected error');
  });

  imageQueue.process(function (job: any, done: any): void {
    // transcode image asynchronously and report progress
    job.progress(42);

    // call done when finished
    done();

    // or give a error if error
    done(new Error('error transcoding'));

    // or pass it a result
    done(null, { width: 1280, height: 720 /* etc... */ });

    // If the job throws an unhandled exception it is also handled correctly
    throw new Error('some unexpected error');
  });

  pdfQueue.process((job: any, done: any) => {
    // Processors can also return promises instead of using the done callback
    // return pdfAsyncProcessor();
  });

  videoQueue.add({video: 'http://example.com/video1.mov'});
  imageQueue.add({image: 'http://example.com/image1.tiff'});
}

export { mqMain };
