import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Play, MoreVertical, Search, Filter, ChevronDown, CreditCard, Sparkles, BookOpen, Clock, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 40, scale: 0.97, filter: "blur(6px)" }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
};

const CoursesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Required states
  const [courses, setCourses] = useState([]);
  const [myLearning, setMyLearning] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentForm, setPaymentForm] = useState({ name: '', cardNumber: '', expiry: '', cvv: '', cardName: '', upiId: '', upiMobile: '', bankName: '', accountId: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Other states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [loading, setLoading] = useState(true);
  const [myLearningLoading, setMyLearningLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [discountInfo, setDiscountInfo] = useState({ eligibleForDiscount: false, discountPercentage: 0, paidCourseCount: 0 });

  // Debug: Log button clicks
  const handleCourseAction = async (course, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Safety check
    if (!course._id) {
      console.error("ERROR: course._id is undefined!", course);
      alert("Error: Course ID not found");
      return;
    }
    
    console.log("=== COURSE BUTTON CLICKED ===");
    console.log("course._id:", course._id);
    console.log("course.title:", course.title);
    console.log("enrolled?", enrolledCourseIds.has(course._id));
    console.log("courseType:", course.courseType);

    // CASE 1: Already enrolled
    if (enrolledCourseIds.has(course._id)) {
      console.log("Navigating to /course/player/", course._id);
      navigate(`/course/player/${course._id}`);
      return;
    }

    // CASE 2: Free course
    if (course.courseType === 'free') {
      console.log("Free course - enrolling first");
      try {
        const res = await fetch(`/api/courses/${course._id}/enroll`, {
          method: 'POST',
          credentials: 'include'
        });
        console.log("Enroll response:", res.status);
        if (res.ok) {
          // Update enrolled IDs
          setEnrolledCourseIds(prev => new Set([...prev, course._id]));
          console.log("Navigating to /course/player/", course._id);
          navigate(`/course/player/${course._id}`);
        }
      } catch (err) {
        console.error('Enrollment failed:', err);
      }
      return;
    }
    
    // CASE 3: Paid course
    console.log("Paid course - checking access");
    try {
      const res = await fetch(`/api/courses/course-access/${course._id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      console.log("Access check result:", data);
      
      if (data.access) {
        console.log("Has access - navigating to /course/player/", course._id);
        navigate(`/course/player/${course._id}`);
      } else {
        console.log("No access - opening payment modal");
        setSelectedCourse(course);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Access check failed', err);
      setSelectedCourse(course);
      setIsModalOpen(true);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Payment submitted for course:", selectedCourse?._id);
    console.log("selectedCourse object:", selectedCourse);
    console.log("Payment method:", paymentMethod);
    
    if (!selectedCourse || !selectedCourse._id) {
      alert("Error: Course not selected properly");
      setPaymentLoading(false);
      return;
    }
    
    // Validate name
    if (!paymentForm.name) {
      alert('Please fill in your name');
      setPaymentLoading(false);
      return;
    }
    
    if (paymentMethod === 'card') {
      if (!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvv || !paymentForm.cardName) {
        alert('Please fill all card details');
        setPaymentLoading(false);
        return;
      }
      // Card number validation (basic)
      const cardNum = paymentForm.cardNumber.replace(/\s/g, '');
      if (cardNum.length < 13 || cardNum.length > 19 || !/^\d+$/.test(cardNum)) {
        alert('Please enter a valid card number');
        setPaymentLoading(false);
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentForm.upiId && !paymentForm.upiMobile) {
        alert('Please enter UPI ID or mobile number');
        setPaymentLoading(false);
        return;
      }
      if (paymentForm.upiMobile && !/^\d{10}$/.test(paymentForm.upiMobile)) {
        alert('Please enter a valid 10-digit mobile number');
        setPaymentLoading(false);
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!paymentForm.bankName || !paymentForm.accountId) {
        alert('Please fill bank name and account ID');
        setPaymentLoading(false);
        return;
      }
    }
    
    setPaymentLoading(true);
    
    try {
      const res = await fetch('/api/courses/fake-payment', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: selectedCourse._id,
          name: paymentForm.name,
          paymentMethod: paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'netbanking' ? 'Net Banking' : 'Credit Card',
          cardNumber: paymentMethod === 'card' ? paymentForm.cardNumber : '',
          expiry: paymentMethod === 'card' ? paymentForm.expiry : '',
          cvv: paymentMethod === 'card' ? paymentForm.cvv : '',
          cardName: paymentMethod === 'card' ? paymentForm.cardName : '',
          upiId: paymentMethod === 'upi' ? paymentForm.upiId : '',
          upiMobile: paymentMethod === 'upi' ? paymentForm.upiMobile : '',
          bankName: paymentMethod === 'netbanking' ? paymentForm.bankName : '',
          accountId: paymentMethod === 'netbanking' ? paymentForm.accountId : ''
        })
      });

      const data = await res.json();
      console.log("Payment response:", data);
      
      // Check if payment was successful
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Payment failed');
      }

      // Success toast
      alert('Payment Successful! Course unlocked.');

      // Success - close modal and navigate
      console.log("=== PAYMENT SUCCESS ===");
      console.log("Message:", data.message);
      console.log("Navigating to /course/player/", selectedCourse._id);
      
      setIsModalOpen(false);
      setPaymentForm({ name: '', cardNumber: '', expiry: '', cvv: '', cardName: '', upiId: '', upiMobile: '', bankName: '', accountId: '' });
      
      // Update enrolled courses
      setEnrolledCourseIds(prev => new Set([...prev, selectedCourse._id]));
      
      // Navigate to learning page
      navigate(`/course/player/${selectedCourse._id}`, { replace: true });
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Payment could not be completed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Courses | Campus Recruit";
    
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        console.log("Courses fetched:", data?.length || 0);
        setCourses(data || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchMyLearning = async () => {
      try {
        const response = await fetch('/api/courses/my-learning', { credentials: 'include' });
        console.log("My learning response:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("My learning courses:", data?.length || 0);
          setMyLearning(data || []);
          setEnrolledCourseIds(new Set((data || []).map(c => c._id)));
        }
      } catch (err) {
        console.error('Error fetching my learning:', err);
      } finally {
        setMyLearningLoading(false);
      }
    };

    const fetchDiscountInfo = async () => {
      try {
        const response = await fetch('/api/courses/discount-info', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setDiscountInfo({
            eligibleForDiscount: data.eligibleForDiscount,
            discountPercentage: data.discountPercentage,
            paidCourseCount: data.paidCourseCount
          });
        }
      } catch (err) {
        console.error('Error fetching discount info:', err);
      }
    };

    fetchCourses();
    fetchMyLearning();
    fetchDiscountInfo();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  useEffect(() => { setVisibleCount(6); }, [searchQuery, selectedLevel]);

  // Get button text based on course status
  const getButtonText = (course) => {
    if (enrolledCourseIds.has(course._id)) {
      return <>Continue Learning <ArrowRight size={18} /></>;
    }
    if (course.courseType === 'paid') {
      return <>Buy Now</>;
    }
    return <>Start Learning <Play size={18} className="fill-current" /></>;
  };

  // Calculate discounted price
  const getDisplayPrice = (course) => {
    if (course.courseType === 'paid' && discountInfo.eligibleForDiscount && !enrolledCourseIds.has(course._id)) {
      const discount = course.price * (discountInfo.discountPercentage / 100);
      return Math.round(course.price - discount);
    }
    return course.price;
  };

  return (
    <div className="min-h-full">
      {/* Ambient background */}
      <div className="ambient-bg" />

      <div className="relative z-10 space-y-8">
        {/* ── Header ───────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
              >
                My <span className="text-gradient-vivid">Courses</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="text-gray-500 dark:text-gray-400 text-lg mt-1"
              >
                Continue where you left off
              </motion.p>
              {discountInfo.paidCourseCount > 0 && (
                <motion.p
                  initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-sm text-teal-400 mt-2"
                >
                  {discountInfo.eligibleForDiscount 
                    ? `🎉 You've purchased ${discountInfo.paidCourseCount} paid courses! ${discountInfo.discountPercentage}% discount on your next course!`
                    : `Complete ${3 - discountInfo.paidCourseCount} more paid courses to get a discount!`}
                </motion.p>
              )}
            </div>
          </div>
        </Reveal>

        {/* ── Search & Filter ──────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="courseSearch" name="courseSearch" type="text" placeholder="Search for courses..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 glass-card rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
            </div>
            <div className="min-w-[200px] relative">
              <select id="courseLevelFilter" name="courseLevelFilter" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3.5 glass-card rounded-xl text-gray-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </Reveal>

        {/* ── My Learning Section ──────────────────────────── */}
        {(!myLearningLoading && myLearning.length > 0) && (
          <Reveal delay={0.15}>
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="text-teal-400" size={24} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Learning</h2>
                <span className="text-sm text-gray-500">({myLearning.length} courses)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myLearning.map((enrolledCourse, index) => (
                  <motion.div
                    key={enrolledCourse._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      console.log("My Learning card clicked", enrolledCourse._id);
                      navigate(`/course/player/${enrolledCourse._id}`);
                    }}
                    className="glass-card rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex gap-4 p-4">
                      <img 
                        src={enrolledCourse.thumbnail || "https://placehold.co/100x67?text=Course"} 
                        alt={enrolledCourse.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                          {enrolledCourse.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{enrolledCourse.instructor}</p>
                        {enrolledCourse.progress > 0 && (
                          <>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{enrolledCourse.progress}% Complete</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-blue-500 h-1.5 rounded-full"
                              style={{ width: `${enrolledCourse.progress}%` }}
                            />
                          </div>
                          </>
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Course Grid ─────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <div className="h-48 skeleton" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-3/4 skeleton" />
                  <div className="h-4 w-1/2 skeleton" />
                  <div className="h-2 w-full skeleton mt-4" />
                  <div className="h-12 w-full skeleton mt-4 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Reveal>
            <div className="text-center py-16 glass-panel rounded-2xl">
              <div className="text-red-500 dark:text-red-400 text-lg font-semibold">{error}</div>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.slice(0, visibleCount).map((course, index) => (
                <motion.div
                  key={course._id || index}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group glass-card rounded-2xl overflow-hidden gradient-border"
                >
                  {/* Card Image */}
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={course.thumbnail || course.image || "https://placehold.co/300x200?text=Course"} 
                      alt={course.title || "Course"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 p-2 glass-panel rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                      <MoreVertical size={16} className="text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="px-3 py-1 text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full backdrop-blur-md">
                        {course.level}
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md ${
                        course.courseType === 'paid' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {course.courseType === 'paid' ? `₹${course.price}` : 'Free'}
                      </span>
                      {course.courseType === 'paid' && discountInfo.eligibleForDiscount && !enrolledCourseIds.has(course._id) && (
                        <span className="px-3 py-1 text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 rounded-full backdrop-blur-md">
                          {discountInfo.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-gradient transition-all line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 flex items-center gap-1">
                      <Users size={14} /> {course.instructor}
                    </p>

                    {/* Rating Display */}
                    {(course.totalRatings > 0 || course.rating) && (
                      <div className="mb-3 flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {course.rating ? course.rating.toFixed(1) : '0.0'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({course.totalRatings || 0} ratings)
                        </span>
                      </div>
                    )}

                    {/* Progress Bar - Only show when enrolled AND progress exists */}
                    {enrolledCourseIds.has(course._id) && (course.progress || 0) > 0 && (
                      <div className="mb-5">
                        <div className="flex justify-between text-xs mb-2 font-medium text-gray-500">
                          <span>{course.progress || 0}% Complete</span>
                          <span>{course.completedChapters?.length || 0}/{course.chapters?.length || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress || 0}%` }}
                            transition={{ duration: 1.5, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full shadow-lg shadow-emerald-500/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA Button - Fixed with type="button" and proper click handling */}
                    <button
                      type="button"
                      onClick={(e) => handleCourseAction(course, e)}
                      className="w-full py-3.5 rounded-xl btn-gradient flex items-center justify-center gap-2 font-bold cursor-pointer relative z-10"
                    >
                      {getButtonText(course)}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <Reveal className="col-span-full">
                <div className="text-center py-16 glass-panel rounded-2xl">
                  <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 text-lg">No courses found matching your filters.</p>
                </div>
              </Reveal>
            )}

            {/* Load More */}
            {filteredCourses.length > visibleCount && (
              <div className="col-span-full flex justify-center mt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-8 py-3 btn-ghost rounded-xl font-semibold flex items-center gap-2 group"
                >
                  Load More <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1A1F2E] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Complete Purchase</h2>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="font-bold text-gray-900 dark:text-white">{selectedCourse.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCourse.instructor}</p>
              <div className="mt-2 flex items-center gap-2">
                {discountInfo.eligibleForDiscount && (
                  <span className="text-lg text-gray-400 line-through">₹{selectedCourse.price}</span>
                )}
                <div className="text-2xl font-bold text-teal-600">
                  ₹{getDisplayPrice(selectedCourse)}
                </div>
                {discountInfo.eligibleForDiscount && (
                  <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    {discountInfo.discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'card' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'upi' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'netbanking' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Net Banking
              </button>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input aria-label="Input field" 
                  type="text"
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Card Payment Fields */}
              {paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                    <input aria-label="Input field" 
                      type="text"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name on Card</label>
                    <input aria-label="Input field" 
                      type="text"
                      value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry</label>
                      <input aria-label="Input field" 
                        type="text"
                        value={paymentForm.expiry}
                        onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                      <input aria-label="Input field" 
                        type="text"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* UPI Payment Fields */}
              {paymentMethod === 'upi' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UPI ID</label>
                    <input aria-label="Input field" 
                      type="text"
                      value={paymentForm.upiId}
                      onChange={(e) => setPaymentForm({...paymentForm, upiId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="yourname@upi"
                    />
                  </div>
                  <div className="text-center text-gray-400 text-sm">- OR -</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                    <input aria-label="Input field" 
                      type="text"
                      value={paymentForm.upiMobile}
                      onChange={(e) => setPaymentForm({...paymentForm, upiMobile: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="9876543210"
                      maxLength="10"
                    />
                  </div>
                </>
              )}

              {/* Net Banking Payment Fields */}
              {paymentMethod === 'netbanking' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                    <select
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({...paymentForm, bankName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    >
                      <option value="">Select Bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="PNB">Punjab National Bank</option>
                      <option value="Yes Bank">Yes Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account ID</label>
                    <input aria-label="Input field" 
                      type="text"
                      value={paymentForm.accountId}
                      onChange={(e) => setPaymentForm({...paymentForm, accountId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="1234567890"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full py-3.5 btn-gradient rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{getDisplayPrice(selectedCourse)}</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
