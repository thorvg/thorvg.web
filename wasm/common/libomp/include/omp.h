/*
 * ==============================================================================
 * The LLVM Project is under the Apache License v2.0 with LLVM Exceptions:
 * ==============================================================================
 *
 *                                  Apache License
 *                            Version 2.0, January 2004
 *                         http://www.apache.org/licenses/
 *
 *     TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
 *
 *     1. Definitions.
 *
 *       "License" shall mean the terms and conditions for use, reproduction,
 *       and distribution as defined by Sections 1 through 9 of this document.
 *
 *       "Licensor" shall mean the copyright owner or entity authorized by
 *       the copyright owner that is granting the License.
 *
 *       "Legal Entity" shall mean the union of the acting entity and all
 *       other entities that control, are controlled by, or are under common
 *       control with that entity. For the purposes of this definition,
 *       "control" means (i) the power, direct or indirect, to cause the
 *       direction or management of such entity, whether by contract or
 *       otherwise, or (ii) ownership of fifty percent (50%) or more of the
 *       outstanding shares, or (iii) beneficial ownership of such entity.
 *
 *       "You" (or "Your") shall mean an individual or Legal Entity
 *       exercising permissions granted by this License.
 *
 *       "Source" form shall mean the preferred form for making modifications,
 *       including but not limited to software source code, documentation
 *       source, and configuration files.
 *
 *       "Object" form shall mean any form resulting from mechanical
 *       transformation or translation of a Source form, including but
 *       not limited to compiled object code, generated documentation,
 *       and conversions to other media types.
 *
 *       "Work" shall mean the work of authorship, whether in Source or
 *       Object form, made available under the License, as indicated by a
 *       copyright notice that is included in or attached to the work
 *       (an example is provided in the Appendix below).
 *
 *       "Derivative Works" shall mean any work, whether in Source or Object
 *       form, that is based on (or derived from) the Work and for which the
 *       editorial revisions, annotations, elaborations, or other modifications
 *       represent, as a whole, an original work of authorship. For the purposes
 *       of this License, Derivative Works shall not include works that remain
 *       separable from, or merely link (or bind by name) to the interfaces of,
 *       the Work and Derivative Works thereof.
 *
 *       "Contribution" shall mean any work of authorship, including
 *       the original version of the Work and any modifications or additions
 *       to that Work or Derivative Works thereof, that is intentionally
 *       submitted to Licensor for inclusion in the Work by the copyright owner
 *       or by an individual or Legal Entity authorized to submit on behalf of
 *       the copyright owner. For the purposes of this definition, "submitted"
 *       means any form of electronic, verbal, or written communication sent
 *       to the Licensor or its representatives, including but not limited to
 *       communication on electronic mailing lists, source code control systems,
 *       and issue tracking systems that are managed by, or on behalf of, the
 *       Licensor for the purpose of discussing and improving the Work, but
 *       excluding communication that is conspicuously marked or otherwise
 *       designated in writing by the copyright owner as "Not a Contribution."
 *
 *       "Contributor" shall mean Licensor and any individual or Legal Entity
 *       on behalf of whom a Contribution has been received by Licensor and
 *       subsequently incorporated within the Work.
 *
 *     2. Grant of Copyright License. Subject to the terms and conditions of
 *       this License, each Contributor hereby grants to You a perpetual,
 *       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
 *       copyright license to reproduce, prepare Derivative Works of,
 *       publicly display, publicly perform, sublicense, and distribute the
 *       Work and such Derivative Works in Source or Object form.
 *
 *     3. Grant of Patent License. Subject to the terms and conditions of
 *       this License, each Contributor hereby grants to You a perpetual,
 *       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
 *       (except as stated in this section) patent license to make, have made,
 *       use, offer to sell, sell, import, and otherwise transfer the Work,
 *       where such license applies only to those patent claims licensable
 *       by such Contributor that are necessarily infringed by their
 *       Contribution(s) alone or by combination of their Contribution(s)
 *       with the Work to which such Contribution(s) was submitted. If You
 *       institute patent litigation against any entity (including a
 *       cross-claim or counterclaim in a lawsuit) alleging that the Work
 *       or a Contribution incorporated within the Work constitutes direct
 *       or contributory patent infringement, then any patent licenses
 *       granted to You under this License for that Work shall terminate
 *       as of the date such litigation is filed.
 *
 *     4. Redistribution. You may reproduce and distribute copies of the
 *       Work or Derivative Works thereof in any medium, with or without
 *       modifications, and in Source or Object form, provided that You
 *       meet the following conditions:
 *
 *       (a) You must give any other recipients of the Work or
 *           Derivative Works a copy of this License; and
 *
 *       (b) You must cause any modified files to carry prominent notices
 *           stating that You changed the files; and
 *
 *       (c) You must retain, in the Source form of any Derivative Works
 *           that You distribute, all copyright, patent, trademark, and
 *           attribution notices from the Source form of the Work,
 *           excluding those notices that do not pertain to any part of
 *           the Derivative Works; and
 *
 *       (d) If the Work includes a "NOTICE" text file as part of its
 *           distribution, then any Derivative Works that You distribute must
 *           include a readable copy of the attribution notices contained
 *           within such NOTICE file, excluding those notices that do not
 *           pertain to any part of the Derivative Works, in at least one
 *           of the following places: within a NOTICE text file distributed
 *           as part of the Derivative Works; within the Source form or
 *           documentation, if provided along with the Derivative Works; or,
 *           within a display generated by the Derivative Works, if and
 *           wherever such third-party notices normally appear. The contents
 *           of the NOTICE file are for informational purposes only and
 *           do not modify the License. You may add Your own attribution
 *           notices within Derivative Works that You distribute, alongside
 *           or as an addendum to the NOTICE text from the Work, provided
 *           that such additional attribution notices cannot be construed
 *           as modifying the License.
 *
 *       You may add Your own copyright statement to Your modifications and
 *       may provide additional or different license terms and conditions
 *       for use, reproduction, or distribution of Your modifications, or
 *       for any such Derivative Works as a whole, provided Your use,
 *       reproduction, and distribution of the Work otherwise complies with
 *       the conditions stated in this License.
 *
 *     5. Submission of Contributions. Unless You explicitly state otherwise,
 *       any Contribution intentionally submitted for inclusion in the Work
 *       by You to the Licensor shall be under the terms and conditions of
 *       this License, without any additional terms or conditions.
 *       Notwithstanding the above, nothing herein shall supersede or modify
 *       the terms of any separate license agreement you may have executed
 *       with Licensor regarding such Contributions.
 *
 *     6. Trademarks. This License does not grant permission to use the trade
 *       names, trademarks, service marks, or product names of the Licensor,
 *       except as required for reasonable and customary use in describing the
 *       origin of the Work and reproducing the content of the NOTICE file.
 *
 *     7. Disclaimer of Warranty. Unless required by applicable law or
 *       agreed to in writing, Licensor provides the Work (and each
 *       Contributor provides its Contributions) on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 *       implied, including, without limitation, any warranties or conditions
 *       of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
 *       PARTICULAR PURPOSE. You are solely responsible for determining the
 *       appropriateness of using or redistributing the Work and assume any
 *       risks associated with Your exercise of permissions under this License.
 *
 *     8. Limitation of Liability. In no event and under no legal theory,
 *       whether in tort (including negligence), contract, or otherwise,
 *       unless required by applicable law (such as deliberate and grossly
 *       negligent acts) or agreed to in writing, shall any Contributor be
 *       liable to You for damages, including any direct, indirect, special,
 *       incidental, or consequential damages of any character arising as a
 *       result of this License or out of the use or inability to use the
 *       Work (including but not limited to damages for loss of goodwill,
 *       work stoppage, computer failure or malfunction, or any and all
 *       other commercial damages or losses), even if such Contributor
 *       has been advised of the possibility of such damages.
 *
 *     9. Accepting Warranty or Additional Liability. While redistributing
 *       the Work or Derivative Works thereof, You may choose to offer,
 *       and charge a fee for, acceptance of support, warranty, indemnity,
 *       or other liability obligations and/or rights consistent with this
 *       License. However, in accepting such obligations, You may act only
 *       on Your own behalf and on Your sole responsibility, not on behalf
 *       of any other Contributor, and only if You agree to indemnify,
 *       defend, and hold each Contributor harmless for any liability
 *       incurred by, or claims asserted against, such Contributor by reason
 *       of your accepting any such warranty or additional liability.
 *
 *     END OF TERMS AND CONDITIONS
 *
 *     APPENDIX: How to apply the Apache License to your work.
 *
 *       To apply the Apache License to your work, attach the following
 *       boilerplate notice, with the fields enclosed by brackets "[]"
 *       replaced with your own identifying information. (Don't include
 *       the brackets!)  The text should be enclosed in the appropriate
 *       comment syntax for the file format. We also recommend that a
 *       file or class name and description of purpose be included on the
 *       same "printed page" as the copyright notice for easier
 *       identification within third-party archives.
 *
 *     Copyright [yyyy] [name of copyright owner]
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 *
 * ---- LLVM Exceptions to the Apache 2.0 License ----
 *
 * As an exception, if, as a result of your compiling your source code, portions
 * of this Software are embedded into an Object form of such source code, you
 * may redistribute such embedded portions in such Object form without complying
 * with the conditions of Sections 4(a), 4(b) and 4(d) of the License.
 *
 * In addition, if you combine or link compiled forms of this Software with
 * software that is licensed under the GPLv2 ("Combined Software") and if a
 * court of competent jurisdiction determines that the patent provision (Section
 * 3), the indemnity provision (Section 9) or other Section of the License
 * conflicts with the conditions of the GPLv2, you may retroactively and
 * prospectively choose to deem waived or otherwise exclude such Section(s) of
 * the License, but only in their entirety and only with respect to the Combined
 * Software.
 *
 * ==============================================================================
 * Software from third parties included in the LLVM Project:
 * ==============================================================================
 * The LLVM Project contains third party software which is under different license
 * terms. All such code will be identified clearly using at least one of two
 * mechanisms:
 * 1) It will be in a separate directory tree with its own `LICENSE.txt` or
 *    `LICENSE` file at the top containing the specific license and restrictions
 *    which apply to that software, or
 * 2) It will contain specific license and restriction terms at the top of every
 *    file.
 *
 * ==============================================================================
 * Legacy LLVM License (https://llvm.org/docs/DeveloperPolicy.html#legacy):
 * ==============================================================================
 *
 * The software contained in this directory tree is dual licensed under both the
 * University of Illinois "BSD-Like" license and the MIT license.  As a user of
 * this code you may choose to use it under either license.  As a contributor,
 * you agree to allow your code to be used under both.  The full text of the
 * relevant licenses is included below.
 *
 * In addition, a license agreement from the copyright/patent holders of the
 * software contained in this directory tree is included below.
 *
 * ==============================================================================
 *
 * University of Illinois/NCSA
 * Open Source License
 *
 * Copyright (c) 1997-2019 Intel Corporation
 *
 * All rights reserved.
 *
 * Developed by:
 *     OpenMP Runtime Team
 *     Intel Corporation
 *     http://www.openmprtl.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal with
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimers.
 *
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimers in the
 *       documentation and/or other materials provided with the distribution.
 *
 *     * Neither the names of Intel Corporation OpenMP Runtime Team nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this Software without specific prior written permission.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS WITH THE
 * SOFTWARE.
 *
 * ==============================================================================
 *
 * Copyright (c) 1997-2019 Intel Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * ==============================================================================
 *
 * Intel Corporation
 *
 * Software Grant License Agreement ("Agreement")
 *
 * Except for the license granted herein to you, Intel Corporation ("Intel") reserves
 * all right, title, and interest in and to the Software (defined below).
 *
 * Definition
 *
 * "Software" means the code and documentation as well as any original work of
 * authorship, including any modifications or additions to an existing work, that
 * is intentionally submitted by Intel to llvm.org (http://llvm.org) ("LLVM") for
 * inclusion in, or documentation of, any of the products owned or managed by LLVM
 * (the "Work"). For the purposes of this definition, "submitted" means any form of
 * electronic, verbal, or written communication sent to LLVM or its
 * representatives, including but not limited to communication on electronic
 * mailing lists, source code control systems, and issue tracking systems that are
 * managed by, or on behalf of, LLVM for the purpose of discussing and improving
 * the Work, but excluding communication that is conspicuously marked otherwise.
 *
 * 1. Grant of Copyright License. Subject to the terms and conditions of this
 *    Agreement, Intel hereby grants to you and to recipients of the Software
 *    distributed by LLVM a perpetual, worldwide, non-exclusive, no-charge,
 *    royalty-free, irrevocable copyright license to reproduce, prepare derivative
 *    works of, publicly display, publicly perform, sublicense, and distribute the
 *    Software and such derivative works.
 *
 * 2. Grant of Patent License. Subject to the terms and conditions of this
 *    Agreement, Intel hereby grants you and to recipients of the Software
 *    distributed by LLVM a perpetual, worldwide, non-exclusive, no-charge,
 *    royalty-free, irrevocable (except as stated in this section) patent license
 *    to make, have made, use, offer to sell, sell, import, and otherwise transfer
 *    the Work, where such license applies only to those patent claims licensable
 *    by Intel that are necessarily infringed by Intel's Software alone or by
 *    combination of the Software with the Work to which such Software was
 *    submitted. If any entity institutes patent litigation against Intel or any
 *    other entity (including a cross-claim or counterclaim in a lawsuit) alleging
 *    that Intel's Software, or the Work to which Intel has contributed constitutes
 *    direct or contributory patent infringement, then any patent licenses granted
 *    to that entity under this Agreement for the Software or Work shall terminate
 *    as of the date such litigation is filed.
 *
 * Unless required by applicable law or agreed to in writing, the software is
 * provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied, including, without limitation, any warranties or
 * conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
 * PARTICULAR PURPOSE.
 *
 * ==============================================================================
 */

/*
 * include/omp.h.var
 */


//===----------------------------------------------------------------------===//
//
// Part of the LLVM Project, under the Apache License v2.0 with LLVM Exceptions.
// See https://llvm.org/LICENSE.txt for license information.
// SPDX-License-Identifier: Apache-2.0 WITH LLVM-exception
//
//===----------------------------------------------------------------------===//


#ifndef __OMP_H
#   define __OMP_H

#   ifndef __has_include
#   define __has_include(x) 0
#   endif

#   include <stddef.h>
#   if (__has_include(<stdlib.h>))
#     include <stdlib.h>
#   endif
#   include <stdint.h>

#   define KMP_VERSION_MAJOR    5
#   define KMP_VERSION_MINOR    0
#   define KMP_VERSION_BUILD    20140926
#   define KMP_BUILD_DATE       "No_Timestamp"

#   ifdef __cplusplus
    extern "C" {
#   endif

#   define omp_set_affinity_format   ompc_set_affinity_format
#   define omp_get_affinity_format   ompc_get_affinity_format
#   define omp_display_affinity      ompc_display_affinity
#   define omp_capture_affinity      ompc_capture_affinity

#   if defined(_WIN32)
#       define __KAI_KMPC_CONVENTION __cdecl
#       ifndef __KMP_IMP
#           define __KMP_IMP __declspec(dllimport)
#       endif
#   else
#       define __KAI_KMPC_CONVENTION
#       ifndef __KMP_IMP
#           define __KMP_IMP
#       endif
#   endif

    /* schedule kind constants */
    typedef enum omp_sched_t {
        omp_sched_static  = 1,
        omp_sched_dynamic = 2,
        omp_sched_guided  = 3,
        omp_sched_auto    = 4,
        omp_sched_monotonic = 0x80000000
    } omp_sched_t;

    /* set API functions */
    extern void   __KAI_KMPC_CONVENTION  omp_set_num_threads (int);
    extern void   __KAI_KMPC_CONVENTION  omp_set_dynamic     (int);
    extern void   __KAI_KMPC_CONVENTION  omp_set_nested      (int);
    extern void   __KAI_KMPC_CONVENTION  omp_set_max_active_levels (int);
    extern void   __KAI_KMPC_CONVENTION  omp_set_schedule          (omp_sched_t, int);

    /* query API functions */
    extern int    __KAI_KMPC_CONVENTION  omp_get_num_threads  (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_dynamic      (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_nested       (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_max_threads  (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_thread_num   (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_num_procs    (void);
    extern int    __KAI_KMPC_CONVENTION  omp_in_parallel      (void);
    extern int    __KAI_KMPC_CONVENTION  omp_in_final         (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_active_level        (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_level               (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_ancestor_thread_num (int);
    extern int    __KAI_KMPC_CONVENTION  omp_get_team_size           (int);
    extern int    __KAI_KMPC_CONVENTION  omp_get_thread_limit        (void);
    extern int    __KAI_KMPC_CONVENTION  omp_get_max_active_levels   (void);
    extern void   __KAI_KMPC_CONVENTION  omp_get_schedule            (omp_sched_t *, int *);
    extern int    __KAI_KMPC_CONVENTION  omp_get_max_task_priority   (void);

    /* lock API functions */
    typedef struct omp_lock_t {
        void * _lk;
    } omp_lock_t;

    extern void   __KAI_KMPC_CONVENTION  omp_init_lock    (omp_lock_t *);
    extern void   __KAI_KMPC_CONVENTION  omp_set_lock     (omp_lock_t *);
    extern void   __KAI_KMPC_CONVENTION  omp_unset_lock   (omp_lock_t *);
    extern void   __KAI_KMPC_CONVENTION  omp_destroy_lock (omp_lock_t *);
    extern int    __KAI_KMPC_CONVENTION  omp_test_lock    (omp_lock_t *);

    /* nested lock API functions */
    typedef struct omp_nest_lock_t {
        void * _lk;
    } omp_nest_lock_t;

    extern void   __KAI_KMPC_CONVENTION  omp_init_nest_lock    (omp_nest_lock_t *);
    extern void   __KAI_KMPC_CONVENTION  omp_set_nest_lock     (omp_nest_lock_t *);
    extern void   __KAI_KMPC_CONVENTION  omp_unset_nest_lock   (omp_nest_lock_t *);
    extern void   __KAI_KMPC_CONVENTION  omp_destroy_nest_lock (omp_nest_lock_t *);
    extern int    __KAI_KMPC_CONVENTION  omp_test_nest_lock    (omp_nest_lock_t *);

    /* OpenMP 5.0  Synchronization hints*/
    typedef enum omp_sync_hint_t {
        omp_sync_hint_none           = 0,
        omp_lock_hint_none           = omp_sync_hint_none,
        omp_sync_hint_uncontended    = 1,
        omp_lock_hint_uncontended    = omp_sync_hint_uncontended,
        omp_sync_hint_contended      = (1<<1),
        omp_lock_hint_contended      = omp_sync_hint_contended,
        omp_sync_hint_nonspeculative = (1<<2),
        omp_lock_hint_nonspeculative = omp_sync_hint_nonspeculative,
        omp_sync_hint_speculative    = (1<<3),
        omp_lock_hint_speculative    = omp_sync_hint_speculative,
        kmp_lock_hint_hle            = (1<<16),
        kmp_lock_hint_rtm            = (1<<17),
        kmp_lock_hint_adaptive       = (1<<18)
    } omp_sync_hint_t;

    /* lock hint type for dynamic user lock */
    typedef omp_sync_hint_t omp_lock_hint_t;

    /* hinted lock initializers */
    extern void __KAI_KMPC_CONVENTION omp_init_lock_with_hint(omp_lock_t *, omp_lock_hint_t);
    extern void __KAI_KMPC_CONVENTION omp_init_nest_lock_with_hint(omp_nest_lock_t *, omp_lock_hint_t);

    /* time API functions */
    extern double __KAI_KMPC_CONVENTION  omp_get_wtime (void);
    extern double __KAI_KMPC_CONVENTION  omp_get_wtick (void);

    /* OpenMP 4.0 */
    extern int  __KAI_KMPC_CONVENTION  omp_get_default_device (void);
    extern void __KAI_KMPC_CONVENTION  omp_set_default_device (int);
    extern int  __KAI_KMPC_CONVENTION  omp_is_initial_device (void);
    extern int  __KAI_KMPC_CONVENTION  omp_get_num_devices (void);
    extern int  __KAI_KMPC_CONVENTION  omp_get_num_teams (void);
    extern int  __KAI_KMPC_CONVENTION  omp_get_team_num (void);
    extern int  __KAI_KMPC_CONVENTION  omp_get_cancellation (void);

    /* OpenMP 4.5 */
    extern int   __KAI_KMPC_CONVENTION  omp_get_initial_device (void);
    extern void* __KAI_KMPC_CONVENTION  omp_target_alloc(size_t, int);
    extern void  __KAI_KMPC_CONVENTION  omp_target_free(void *, int);
    extern int   __KAI_KMPC_CONVENTION  omp_target_is_present(const void *, int);
    extern int   __KAI_KMPC_CONVENTION  omp_target_memcpy(void *, const void *, size_t, size_t, size_t, int, int);
    extern int   __KAI_KMPC_CONVENTION  omp_target_memcpy_rect(void *, const void *, size_t, int, const size_t *,
                                            const size_t *, const size_t *, const size_t *, const size_t *, int, int);
    extern int   __KAI_KMPC_CONVENTION  omp_target_associate_ptr(const void *, const void *, size_t, size_t, int);
    extern int   __KAI_KMPC_CONVENTION  omp_target_disassociate_ptr(const void *, int);

    /* OpenMP 5.0 */
    extern int   __KAI_KMPC_CONVENTION  omp_get_device_num (void);
    typedef void * omp_depend_t;

    /* OpenMP 5.1 interop */
    typedef intptr_t omp_intptr_t;

    extern void __KAI_KMPC_CONVENTION ompx_dump_mapping_tables(void);

    /* 0..omp_get_num_interop_properties()-1 are reserved for implementation-defined properties */
    typedef enum omp_interop_property {
        omp_ipr_fr_id = -1,
        omp_ipr_fr_name = -2,
        omp_ipr_vendor = -3,
        omp_ipr_vendor_name = -4,
        omp_ipr_device_num = -5,
        omp_ipr_platform = -6,
        omp_ipr_device = -7,
        omp_ipr_device_context = -8,
        omp_ipr_targetsync = -9,
        omp_ipr_first = -9
    } omp_interop_property_t;

    #define omp_interop_none 0

    typedef enum omp_interop_rc {
        omp_irc_no_value = 1,
        omp_irc_success = 0,
        omp_irc_empty = -1,
        omp_irc_out_of_range = -2,
        omp_irc_type_int = -3,
        omp_irc_type_ptr = -4,
        omp_irc_type_str = -5,
        omp_irc_other = -6
    } omp_interop_rc_t;

    typedef enum omp_interop_fr {
        omp_ifr_cuda = 1,
        omp_ifr_cuda_driver = 2,
        omp_ifr_opencl = 3,
        omp_ifr_sycl = 4,
        omp_ifr_hip = 5,
        omp_ifr_level_zero = 6,
        omp_ifr_last = 7
    } omp_interop_fr_t;

    typedef void * omp_interop_t;

    /*!
     * The `omp_get_num_interop_properties` routine retrieves the number of implementation-defined properties available for an `omp_interop_t` object.
     */
    extern int          __KAI_KMPC_CONVENTION  omp_get_num_interop_properties(const omp_interop_t);
    /*!
     * The `omp_get_interop_int` routine retrieves an integer property from an `omp_interop_t` object.
     */
    extern omp_intptr_t __KAI_KMPC_CONVENTION  omp_get_interop_int(const omp_interop_t, omp_interop_property_t, int *);
    /*!
     * The `omp_get_interop_ptr` routine retrieves a pointer property from an `omp_interop_t` object.
     */
    extern void *       __KAI_KMPC_CONVENTION  omp_get_interop_ptr(const omp_interop_t, omp_interop_property_t, int *);
    /*!
     * The `omp_get_interop_str` routine retrieves a string property from an `omp_interop_t` object.
     */
    extern const char * __KAI_KMPC_CONVENTION  omp_get_interop_str(const omp_interop_t, omp_interop_property_t, int *);
    /*!
     * The `omp_get_interop_name` routine retrieves a property name from an `omp_interop_t` object.
     */
    extern const char * __KAI_KMPC_CONVENTION  omp_get_interop_name(const omp_interop_t, omp_interop_property_t);
    /*!
     * The `omp_get_interop_type_desc` routine retrieves a description of the type of a property associated with an `omp_interop_t` object.
     */
    extern const char * __KAI_KMPC_CONVENTION  omp_get_interop_type_desc(const omp_interop_t, omp_interop_property_t);
    /*!
     * The `omp_get_interop_rc_desc` routine retrieves a description of the return code associated with an `omp_interop_t` object.
     */
    extern const char * __KAI_KMPC_CONVENTION  omp_get_interop_rc_desc(const omp_interop_t, omp_interop_rc_t);

    /* OpenMP 5.1 device memory routines */

    /*!
     * The `omp_target_memcpy_async` routine asynchronously performs a copy between any combination of host and device pointers.
     */
    extern int    __KAI_KMPC_CONVENTION  omp_target_memcpy_async(void *, const void *, size_t, size_t, size_t, int,
                                             int, int, omp_depend_t *);
    /*!
     * The `omp_target_memcpy_rect_async` routine asynchronously performs a copy between any combination of host and device pointers.
     */
    extern int    __KAI_KMPC_CONVENTION  omp_target_memcpy_rect_async(void *, const void *, size_t, int, const size_t *,
                                             const size_t *, const size_t *, const size_t *, const size_t *, int, int,
                                             int, omp_depend_t *);

    /* OpenMP 6.0 device memory routines */
    extern void * __KAI_KMPC_CONVENTION omp_target_memset(void *, int, size_t, int);
    extern void * __KAI_KMPC_CONVENTION omp_target_memset_async(void *, int, size_t, int, int, omp_depend_t *);

    /*!
     * The `omp_get_mapped_ptr` routine returns the device pointer that is associated with a host pointer for a given device.
     */
    extern void * __KAI_KMPC_CONVENTION  omp_get_mapped_ptr(const void *, int);
    extern int    __KAI_KMPC_CONVENTION  omp_target_is_accessible(const void *, size_t, int);

    /* kmp API functions */
    extern int    __KAI_KMPC_CONVENTION  kmp_get_stacksize          (void);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_stacksize          (int);
    extern size_t __KAI_KMPC_CONVENTION  kmp_get_stacksize_s        (void);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_stacksize_s        (size_t);
    extern int    __KAI_KMPC_CONVENTION  kmp_get_blocktime          (void);
    extern int    __KAI_KMPC_CONVENTION  kmp_get_library            (void);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_blocktime          (int);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_library            (int);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_library_serial     (void);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_library_turnaround (void);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_library_throughput (void);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_defaults           (char const *);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_disp_num_buffers   (int);

    /* Intel affinity API */
    typedef void * kmp_affinity_mask_t;

    extern int    __KAI_KMPC_CONVENTION  kmp_set_affinity             (kmp_affinity_mask_t *);
    extern int    __KAI_KMPC_CONVENTION  kmp_get_affinity             (kmp_affinity_mask_t *);
    extern int    __KAI_KMPC_CONVENTION  kmp_get_affinity_max_proc    (void);
    extern void   __KAI_KMPC_CONVENTION  kmp_create_affinity_mask     (kmp_affinity_mask_t *);
    extern void   __KAI_KMPC_CONVENTION  kmp_destroy_affinity_mask    (kmp_affinity_mask_t *);
    extern int    __KAI_KMPC_CONVENTION  kmp_set_affinity_mask_proc   (int, kmp_affinity_mask_t *);
    extern int    __KAI_KMPC_CONVENTION  kmp_unset_affinity_mask_proc (int, kmp_affinity_mask_t *);
    extern int    __KAI_KMPC_CONVENTION  kmp_get_affinity_mask_proc   (int, kmp_affinity_mask_t *);

    /* OpenMP 4.0 affinity API */
    typedef enum omp_proc_bind_t {
        omp_proc_bind_false = 0,
        omp_proc_bind_true = 1,
        omp_proc_bind_master = 2,
        omp_proc_bind_close = 3,
        omp_proc_bind_spread = 4
    } omp_proc_bind_t;

    extern omp_proc_bind_t __KAI_KMPC_CONVENTION omp_get_proc_bind (void);

    /* OpenMP 4.5 affinity API */
    extern int  __KAI_KMPC_CONVENTION omp_get_num_places (void);
    extern int  __KAI_KMPC_CONVENTION omp_get_place_num_procs (int);
    extern void __KAI_KMPC_CONVENTION omp_get_place_proc_ids (int, int *);
    extern int  __KAI_KMPC_CONVENTION omp_get_place_num (void);
    extern int  __KAI_KMPC_CONVENTION omp_get_partition_num_places (void);
    extern void __KAI_KMPC_CONVENTION omp_get_partition_place_nums (int *);

    extern void * __KAI_KMPC_CONVENTION  kmp_malloc  (size_t);
    extern void * __KAI_KMPC_CONVENTION  kmp_aligned_malloc  (size_t, size_t);
    extern void * __KAI_KMPC_CONVENTION  kmp_calloc  (size_t, size_t);
    extern void * __KAI_KMPC_CONVENTION  kmp_realloc (void *, size_t);
    extern void   __KAI_KMPC_CONVENTION  kmp_free    (void *);

    extern void   __KAI_KMPC_CONVENTION  kmp_set_warnings_on(void);
    extern void   __KAI_KMPC_CONVENTION  kmp_set_warnings_off(void);

    /* OpenMP 5.0 Tool Control */
    typedef enum omp_control_tool_result_t {
        omp_control_tool_notool = -2,
        omp_control_tool_nocallback = -1,
        omp_control_tool_success = 0,
        omp_control_tool_ignored = 1
    } omp_control_tool_result_t;

    typedef enum omp_control_tool_t {
        omp_control_tool_start = 1,
        omp_control_tool_pause = 2,
        omp_control_tool_flush = 3,
        omp_control_tool_end = 4
    } omp_control_tool_t;

    extern int __KAI_KMPC_CONVENTION omp_control_tool(int, int, void*);

    /* OpenMP 5.0 Memory Management */
    typedef uintptr_t omp_uintptr_t;

    typedef enum {
        omp_atk_sync_hint = 1,
        omp_atk_alignment = 2,
        omp_atk_access = 3,
        omp_atk_pool_size = 4,
        omp_atk_fallback = 5,
        omp_atk_fb_data = 6,
        omp_atk_pinned = 7,
        omp_atk_partition = 8,
        omp_atk_pin_device = 9,
        omp_atk_preferred_device = 10,
        omp_atk_device_access = 11,
        omp_atk_target_access = 12,
        omp_atk_atomic_scope = 13,
        omp_atk_part_size = 14
    } omp_alloctrait_key_t;

    typedef enum {
        omp_atv_false = 0,
        omp_atv_true = 1,
        omp_atv_contended = 3,
        omp_atv_uncontended = 4,
        omp_atv_serialized = 5,
        omp_atv_sequential = omp_atv_serialized, // (deprecated)
        omp_atv_private = 6,
        omp_atv_device = 7,
        omp_atv_thread = 8,
        omp_atv_pteam = 9,
        omp_atv_cgroup = 10,
        omp_atv_default_mem_fb = 11,
        omp_atv_null_fb = 12,
        omp_atv_abort_fb = 13,
        omp_atv_allocator_fb = 14,
        omp_atv_environment = 15,
        omp_atv_nearest = 16,
        omp_atv_blocked = 17,
        omp_atv_interleaved = 18,
        omp_atv_all = 19,
        omp_atv_single = 20,
        omp_atv_multiple = 21,
        omp_atv_memspace = 22
    } omp_alloctrait_value_t;
    #define omp_atv_default ((omp_uintptr_t)-1)

    typedef struct {
        omp_alloctrait_key_t key;
        omp_uintptr_t value;
    } omp_alloctrait_t;

    typedef enum {
        omp_access_cgroup = 0,
        omp_access_pteam = 1
    } omp_access_t;

#   if defined(_WIN32)
    // On Windows cl and icl do not support 64-bit enum, let's use integer then.
    typedef omp_uintptr_t omp_allocator_handle_t;
    extern __KMP_IMP omp_allocator_handle_t const omp_null_allocator;
    extern __KMP_IMP omp_allocator_handle_t const omp_default_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const omp_large_cap_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const omp_const_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const omp_high_bw_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const omp_low_lat_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const omp_cgroup_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const omp_pteam_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const omp_thread_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const llvm_omp_target_host_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const llvm_omp_target_shared_mem_alloc;
    extern __KMP_IMP omp_allocator_handle_t const llvm_omp_target_device_mem_alloc;

    typedef omp_uintptr_t omp_memspace_handle_t;
    extern __KMP_IMP omp_memspace_handle_t const omp_null_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const omp_default_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const omp_large_cap_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const omp_const_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const omp_high_bw_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const omp_low_lat_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const omp_cgroup_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const llvm_omp_target_host_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const llvm_omp_target_shared_mem_space;
    extern __KMP_IMP omp_memspace_handle_t const llvm_omp_target_device_mem_space;
#   else
#       if __cplusplus >= 201103
    typedef enum omp_allocator_handle_t : omp_uintptr_t
#       else
    typedef enum omp_allocator_handle_t
#       endif
    {
      omp_null_allocator = 0,
      omp_default_mem_alloc = 1,
      omp_large_cap_mem_alloc = 2,
      omp_const_mem_alloc = 3,
      omp_high_bw_mem_alloc = 4,
      omp_low_lat_mem_alloc = 5,
      omp_cgroup_mem_alloc = 6,
      omp_pteam_mem_alloc = 7,
      omp_thread_mem_alloc = 8,
      llvm_omp_target_host_mem_alloc = 100,
      llvm_omp_target_shared_mem_alloc = 101,
      llvm_omp_target_device_mem_alloc = 102,
      KMP_ALLOCATOR_MAX_HANDLE = UINTPTR_MAX
    } omp_allocator_handle_t;
#       if __cplusplus >= 201103
    typedef enum omp_memspace_handle_t : omp_uintptr_t
#       else
    typedef enum omp_memspace_handle_t
#       endif
    {
      omp_null_mem_space = 0,
      omp_default_mem_space = 99,
      omp_large_cap_mem_space = 1,
      omp_const_mem_space = 2,
      omp_high_bw_mem_space = 3,
      omp_low_lat_mem_space = 4,
      omp_cgroup_mem_space = 5,
      llvm_omp_target_host_mem_space = 100,
      llvm_omp_target_shared_mem_space = 101,
      llvm_omp_target_device_mem_space = 102,
      KMP_MEMSPACE_MAX_HANDLE = UINTPTR_MAX
    } omp_memspace_handle_t;
#   endif
    extern omp_allocator_handle_t __KAI_KMPC_CONVENTION omp_init_allocator(omp_memspace_handle_t m,
                                                       int ntraits, omp_alloctrait_t traits[]);
    extern void __KAI_KMPC_CONVENTION omp_destroy_allocator(omp_allocator_handle_t allocator);

    extern void __KAI_KMPC_CONVENTION omp_set_default_allocator(omp_allocator_handle_t a);
    extern omp_allocator_handle_t __KAI_KMPC_CONVENTION omp_get_default_allocator(void);
#   ifdef __cplusplus
    extern void *__KAI_KMPC_CONVENTION omp_alloc(size_t size, omp_allocator_handle_t a = omp_null_allocator);
    extern void *__KAI_KMPC_CONVENTION omp_aligned_alloc(size_t align, size_t size,
                                                         omp_allocator_handle_t a = omp_null_allocator);
    extern void *__KAI_KMPC_CONVENTION omp_calloc(size_t nmemb, size_t size,
                                                  omp_allocator_handle_t a = omp_null_allocator);
    extern void *__KAI_KMPC_CONVENTION omp_aligned_calloc(size_t align, size_t nmemb, size_t size,
                                                          omp_allocator_handle_t a = omp_null_allocator);
    extern void *__KAI_KMPC_CONVENTION omp_realloc(void *ptr, size_t size,
                                                   omp_allocator_handle_t allocator = omp_null_allocator,
                                                   omp_allocator_handle_t free_allocator = omp_null_allocator);
    extern void __KAI_KMPC_CONVENTION omp_free(void * ptr, omp_allocator_handle_t a = omp_null_allocator);
    extern void *__KAI_KMPC_CONVENTION omp_get_dyn_gprivate_ptr(size_t offset = 0, omp_access_t access_group = omp_access_cgroup);
    extern void *__KAI_KMPC_CONVENTION omp_get_dyn_gprivate_nofb_ptr(size_t offset = 0, omp_access_t access_group = omp_access_cgroup);
    extern size_t __KAI_KMPC_CONVENTION omp_get_dyn_gprivate_size(omp_access_t access_group = omp_access_cgroup);
    extern omp_memspace_handle_t __KAI_KMPC_CONVENTION omp_get_dyn_gprivate_memspace(omp_access_t access_group = omp_access_cgroup);
    extern size_t __KAI_KMPC_CONVENTION omp_get_gprivate_limit(int device_num, omp_access_t access_group = omp_access_cgroup);
#   else
    extern void *__KAI_KMPC_CONVENTION omp_alloc(size_t size, omp_allocator_handle_t a);
    extern void *__KAI_KMPC_CONVENTION omp_aligned_alloc(size_t align, size_t size,
                                                         omp_allocator_handle_t a);
    extern void *__KAI_KMPC_CONVENTION omp_calloc(size_t nmemb, size_t size, omp_allocator_handle_t a);
    extern void *__KAI_KMPC_CONVENTION omp_aligned_calloc(size_t align, size_t nmemb, size_t size,
                                                          omp_allocator_handle_t a);
    extern void *__KAI_KMPC_CONVENTION omp_realloc(void *ptr, size_t size, omp_allocator_handle_t allocator,
                                                   omp_allocator_handle_t free_allocator);
    extern void __KAI_KMPC_CONVENTION omp_free(void *ptr, omp_allocator_handle_t a);
    extern void *__KAI_KMPC_CONVENTION omp_get_dyn_gprivate_ptr(size_t offset, omp_access_t access_group);
    extern void *__KAI_KMPC_CONVENTION omp_get_dyn_gprivate_nofb_ptr(size_t offset, omp_access_t access_group);
    extern size_t __KAI_KMPC_CONVENTION omp_get_dyn_gprivate_size(omp_access_t access_group);
    extern omp_memspace_handle_t __KAI_KMPC_CONVENTION omp_get_dyn_gprivate_memspace(omp_access_t access_group);
    extern size_t __KAI_KMPC_CONVENTION omp_get_gprivate_limit(int device_num, omp_access_t access_group);
#   endif

    /* OpenMP TR11 routines to get memory spaces and allocators */
    extern omp_memspace_handle_t omp_get_devices_memspace(int ndevs, const int *devs, omp_memspace_handle_t memspace);
    extern omp_memspace_handle_t omp_get_device_memspace(int dev, omp_memspace_handle_t memspace);
    extern omp_memspace_handle_t omp_get_devices_and_host_memspace(int ndevs, const int *devs, omp_memspace_handle_t memspace);
    extern omp_memspace_handle_t omp_get_device_and_host_memspace(int dev, omp_memspace_handle_t memspace);
    extern omp_memspace_handle_t omp_get_devices_all_memspace(omp_memspace_handle_t memspace);
    extern omp_allocator_handle_t omp_get_devices_allocator(int ndevs, const int *devs, omp_memspace_handle_t memspace);
    extern omp_allocator_handle_t omp_get_device_allocator(int dev, omp_memspace_handle_t memspace);
    extern omp_allocator_handle_t omp_get_devices_and_host_allocator(int ndevs, const int *devs, omp_memspace_handle_t memspace);
    extern omp_allocator_handle_t omp_get_device_and_host_allocator(int dev, omp_memspace_handle_t memspace);
    extern omp_allocator_handle_t omp_get_devices_all_allocator(omp_memspace_handle_t memspace);
    extern int omp_get_memspace_num_resources(omp_memspace_handle_t memspace);
    extern omp_memspace_handle_t omp_get_submemspace(omp_memspace_handle_t memspace, int num_resources, int *resources);

    /* OpenMP 5.0 Affinity Format */
    extern void __KAI_KMPC_CONVENTION omp_set_affinity_format(char const *);
    extern size_t __KAI_KMPC_CONVENTION omp_get_affinity_format(char *, size_t);
    extern void __KAI_KMPC_CONVENTION omp_display_affinity(char const *);
    extern size_t __KAI_KMPC_CONVENTION omp_capture_affinity(char *, size_t, char const *);

    /* OpenMP 5.0 events */
#   if defined(_WIN32)
    // On Windows cl and icl do not support 64-bit enum, let's use integer then.
    typedef omp_uintptr_t omp_event_handle_t;
#   else
    typedef enum omp_event_handle_t { KMP_EVENT_MAX_HANDLE = UINTPTR_MAX } omp_event_handle_t;
#   endif
    extern void __KAI_KMPC_CONVENTION omp_fulfill_event ( omp_event_handle_t event );

    /* OpenMP 5.0 Pause Resources */
    typedef enum omp_pause_resource_t {
      omp_pause_resume = 0,
      omp_pause_soft = 1,
      omp_pause_hard = 2,
      omp_pause_stop_tool = 3
    } omp_pause_resource_t;
    extern int __KAI_KMPC_CONVENTION omp_pause_resource(omp_pause_resource_t, int);
    extern int __KAI_KMPC_CONVENTION omp_pause_resource_all(omp_pause_resource_t);

    extern int __KAI_KMPC_CONVENTION omp_get_supported_active_levels(void);

    /* OpenMP 5.1 */
    extern void __KAI_KMPC_CONVENTION omp_set_num_teams(int num_teams);
    extern int __KAI_KMPC_CONVENTION omp_get_max_teams(void);
    extern void __KAI_KMPC_CONVENTION omp_set_teams_thread_limit(int limit);
    extern int __KAI_KMPC_CONVENTION omp_get_teams_thread_limit(void);

    /* OpenMP 5.1 Display Environment */
    extern void omp_display_env(int verbose);

#   if defined(_OPENMP) && _OPENMP >= 201811
    #pragma omp begin declare variant match(device={kind(host)})
    static inline int omp_is_initial_device(void) { return 1; }
    #pragma omp end declare variant
    #pragma omp begin declare variant match(device={kind(nohost)})
    static inline int omp_is_initial_device(void) { return 0; }
    #pragma omp end declare variant
#   endif

    /* OpenMP 5.2 */
    extern int __KAI_KMPC_CONVENTION omp_in_explicit_task(void);
    #define omp_initial_device -1
    #define omp_invalid_device -2

    /* OpenMP 6.0 */
    extern int   __KAI_KMPC_CONVENTION  omp_get_device_from_uid(const char *DeviceUid);
    extern const char *   __KAI_KMPC_CONVENTION  omp_get_uid_from_device(int DeviceNum);

    /* LLVM Extensions */
    extern void *llvm_omp_target_dynamic_shared_alloc(void);

#   undef __KAI_KMPC_CONVENTION
#   undef __KMP_IMP

    /* Warning:
       The following typedefs are not standard, deprecated and will be removed in a future release.
    */
    typedef int     omp_int_t;
    typedef double  omp_wtime_t;

#   ifdef __cplusplus
    }
#   endif

#endif /* __OMP_H */
