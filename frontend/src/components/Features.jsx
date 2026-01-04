import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Target, Clock, Brain, Lock } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Detection',
    description: 'Advanced YOLOv8 model trained on thousands of dermatology images for accurate diagnosis.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get your skin analysis in seconds with real-time processing and visualization.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Target,
    title: '95% Accuracy',
    description: 'State-of-the-art deep learning ensures highly accurate skin condition classification.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Access skin disease detection anytime, anywhere from your mobile or desktop.',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your medical images are encrypted and stored securely with HIPAA compliance.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Lock,
    title: 'Secure Platform',
    description: 'End-to-end encryption and secure authentication protect your sensitive health data.',
    color: 'from-pink-500 to-rose-500'
  }
]

const Features = () => {
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="gradient-text">Doracare</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cutting-edge AI technology makes professional skin disease detection accessible to everyone
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
            >
              <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
