import { Link } from 'react-router-dom';

import illustrationIntro from '../assets/images/illustration-intro.svg';

const Hero = () => {
  return (
    <section id='hero'>
      {/* Flex Container */}
      <div className='container flex flex-col-reverse items-center px-6 mx-auto mt-10 space-y-0 md:space-y-0 md:flex-row'>
        {/* Left Item */}
        <div className='flex flex-col mb-32 space-y-12 md:w-1/2'>
          <h1 className='max-w-md text-4xl font-bold text-center md:text-5xl md:text-left'>
          Worry Kills Happiness
          </h1>
          <p className='max-w-sm text-center text-darkGrayishBlue md:text-left'>
          Worry steals happiness by keeping our minds focused on potential problems rather than 
          enjoying the present moment. It triggers stress, anxiety, and negative thinking, which 
          can cloud our ability to appreciate the good around us. So let us help you in reducing
          one of your worry about medication.
          </p>
          <div className='flex justify-center md:justify-start'>
            <Link
              to='/get-started'
              className='p-3 px-6 pt-2 text-white bg-[#3F7D58] rounded-full baseline '
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className='h-72 w-72'>
          <img src="https://i.pinimg.com/1200x/9c/41/c0/9c41c0e325ed0b8140a6113aa04ba103.jpg" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
